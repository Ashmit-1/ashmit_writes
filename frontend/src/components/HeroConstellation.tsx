import { useCallback, useEffect, useRef } from 'react'

/**
 * "Thought Constellation" — the ambient visual on the right side of the hero.
 *
 * Ideas are represented as a loose field of nodes. Some nodes carry a short,
 * quiet label; nearby nodes are joined by hairline connections. The whole
 * field drifts slowly, and the cursor gently disturbs it: nodes near the
 * pointer brighten and shift, and connections near the pointer become a little
 * more visible.
 *
 * Implementation notes (design.md > Motion, > Hero constellation):
 *   - No animation library: a single requestAnimationFrame loop drives every
 *     node. Animating plain attributes on a handful of elements is cheap.
 *   - Deterministic layout: positions come from a fixed seed table, so the
 *     composition is stable across renders and does not reshuffle on re-render.
 *   - `prefers-reduced-motion` stops the drift loop entirely and renders the
 *     field in its resting state (the visual is preserved, the motion is not).
 *   - Decorative only: `aria-hidden` and non-interactive, so it can never
 *     steal focus or appear in the accessibility tree.
 */

/** A node in the constellation: normalized 0–1 coordinates within the box. */
interface Node {
  x: number
  y: number
  r: number
  /** Optional short label. Sparse on purpose — most nodes are unlabelled. */
  label?: string
}

/** A connection between two node indices. */
type Edge = [number, number]

/**
 * Hand-placed nodes on a normalized grid.
 *
 * Deliberately irregular: radii vary, spacing is uneven, and the distribution
 * avoids rows or columns so the field reads as organic rather than plotted.
 * Labels are short fragments of ideas and appear on only a few nodes.
 */
const NODES: Node[] = [
  { x: 0.14, y: 0.18, r: 2.4 },
  { x: 0.33, y: 0.1, r: 1.6 },
  { x: 0.52, y: 0.2, r: 3.1, label: 'Attention' },
  { x: 0.78, y: 0.13, r: 1.7 },
  { x: 0.24, y: 0.38, r: 1.4 },
  { x: 0.45, y: 0.44, r: 2.6 },
  { x: 0.68, y: 0.36, r: 1.5, label: 'Embeddings' },
  { x: 0.89, y: 0.42, r: 2.1 },
  { x: 0.11, y: 0.6, r: 1.8, label: 'Reasoning' },
  { x: 0.35, y: 0.64, r: 2.9 },
  { x: 0.58, y: 0.58, r: 1.3 },
  { x: 0.8, y: 0.68, r: 2.3 },
  { x: 0.21, y: 0.84, r: 1.5 },
  { x: 0.48, y: 0.88, r: 2.0, label: 'Retrieval' },
  { x: 0.7, y: 0.84, r: 1.6 },
  { x: 0.92, y: 0.88, r: 1.2 },
  { x: 0.62, y: 0.78, r: 1.1 },
  { x: 0.05, y: 0.32, r: 1.2 },
]

/**
 * Connections between nearby nodes. Chosen to suggest relationships between
 * ideas without forming a dense, technical-looking graph: every node is not
 * wired up, and there are no crossing hub patterns.
 */
const EDGES: Edge[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [2, 5],
  [5, 6],
  [6, 7],
  [4, 8],
  [8, 9],
  [9, 5],
  [9, 10],
  [6, 10],
  [10, 11],
  [7, 11],
  [8, 12],
  [12, 13],
  [13, 9],
  [13, 14],
  [14, 11],
  [14, 15],
  [13, 16],
  [16, 14],
  [17, 4],
  [17, 8],
]

/** Distance (in normalized units) at which the cursor starts to matter. */
const INFLUENCE_RADIUS = 0.26
/** Maximum node offset caused by the cursor, in normalized units. */
const MAX_PUSH = 0.02
/** Drift amplitude per node, in normalized units. Kept tiny. */
const DRIFT_AMPLITUDE = 0.006

interface HeroConstellationProps {
  className?: string
}

export function HeroConstellation({ className }: HeroConstellationProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([])
  const labelRefs = useRef<(SVGTextElement | null)[]>([])
  const edgeRefs = useRef<(SVGLineElement | null)[]>([])
  /** Pointer position in normalized box coordinates, or null when away. */
  const pointer = useRef<{ x: number; y: number } | null>(null)

  /** Track the cursor relative to the SVG box. */
  const handlePointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    pointer.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    pointer.current = null
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Positions actually drawn, tracking drift so labels follow their node.
    const current = NODES.map((node) => ({ x: node.x, y: node.y }))

    let frame = 0
    let start: number | null = null

    const draw = (time: number | null) => {
      if (start === null && time !== null) start = time
      const t = time === null || start === null ? 0 : (time - start) / 1000
      const p = pointer.current

      // Node positions + labels -------------------------------------------
      NODES.forEach((node, index) => {
        // Slow, per-node drift. Each node uses its own phase so the field
        // never pulses in unison.
        const phase = index * 1.7
        const driftX = reduceMotion ? 0 : Math.sin(t * 0.22 + phase) * DRIFT_AMPLITUDE
        const driftY = reduceMotion
          ? 0
          : Math.cos(t * 0.17 + phase * 1.3) * DRIFT_AMPLITUDE

        let pushX = 0
        let pushY = 0
        let proximity = 0

        if (p) {
          const dx = node.x - p.x
          const dy = node.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < INFLUENCE_RADIUS) {
            // 1 at the cursor, easing to 0 at the influence edge.
            proximity = 1 - dist / INFLUENCE_RADIUS
            const falloff = proximity * proximity
            // Push gently away from the cursor — the field is "disturbed".
            const safe = Math.max(dist, 0.0001)
            pushX = (dx / safe) * MAX_PUSH * falloff
            pushY = (dy / safe) * MAX_PUSH * falloff
          }
        }

        const cx = node.x + driftX + pushX
        const cy = node.y + driftY + pushY
        current[index] = { x: cx, y: cy }

        const circle = nodeRefs.current[index]
        if (circle) {
          circle.setAttribute('cx', String(cx))
          circle.setAttribute('cy', String(cy))
          // Nearby nodes brighten subtly.
          circle.setAttribute('fill-opacity', String(0.7 + proximity * 0.3))
          circle.setAttribute('r', String(node.r + proximity * 1.1))
        }

        const label = labelRefs.current[index]
        if (label) {
          label.setAttribute('x', String(cx + 0.012))
          label.setAttribute('y', String(cy + 0.008))
          label.setAttribute('fill-opacity', String(0.6 + proximity * 0.4))
        }
      })

      // Connections --------------------------------------------------------
      EDGES.forEach(([a, b], index) => {
        const line = edgeRefs.current[index]
        if (!line) return
        const from = current[a]
        const to = current[b]
        line.setAttribute('x1', String(from.x))
        line.setAttribute('y1', String(from.y))
        line.setAttribute('x2', String(to.x))
        line.setAttribute('y2', String(to.y))

        // A connection is highlighted by how close the cursor is to its
        // midpoint — simpler and calmer than per-endpoint distance.
        let proximity = 0
        if (p) {
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2
          const dist = Math.hypot(mx - p.x, my - p.y)
          if (dist < INFLUENCE_RADIUS) proximity = 1 - dist / INFLUENCE_RADIUS
        }
        line.setAttribute('stroke-opacity', String(0.3 + proximity * 0.5))
      })
    }

    const loop = (time: number) => {
      draw(time)
      frame = requestAnimationFrame(loop)
    }

    // Draw once immediately so the resting state is correct even when motion
    // is disabled and no frame loop runs.
    draw(null)
    if (!reduceMotion) frame = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <g
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth={0.14}
        strokeLinecap="round"
      >
        {EDGES.map(([a, b], index) => (
          <line
            key={`${a}-${b}`}
            ref={(el) => {
              edgeRefs.current[index] = el
            }}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            strokeOpacity={0.3}
          />
        ))}
      </g>

      <g fill="var(--color-secondary)">
        {NODES.map((node, index) => (
          <circle
            key={index}
            ref={(el) => {
              nodeRefs.current[index] = el
            }}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fillOpacity={0.7}
          />
        ))}
      </g>

      {/* Labels last so they sit above dots and lines. */}
      <g
        fill="var(--color-tertiary)"
        style={{ fontSize: '2.5px', letterSpacing: '0.02em' }}
      >
        {NODES.map((node, index) =>
          node.label ? (
            <text
              key={index}
              ref={(el) => {
                labelRefs.current[index] = el
              }}
              x={node.x + 0.012}
              y={node.y + 0.008}
              fillOpacity={0.6}
            >
              {node.label}
            </text>
          ) : null,
        )}
      </g>
    </svg>
  )
}
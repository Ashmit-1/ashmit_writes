import { useCallback, useEffect, useRef } from 'react'

/**
 * "Thought Constellation" — the interactive visual occupying the right side of
 * the hero.
 *
 * A field of ideas: nodes of varying weight, grouped into loose clusters, some
 * carrying a short label. Nearby nodes are joined by hairlines. The field
 * drifts slowly on its own, and the cursor disturbs a local area around itself
 * — nearby nodes shift, brighten and grow, and nearby connections become more
 * visible. The effect reads as "there is a field of ideas here, and moving the
 * cursor through it temporarily reveals relationships between them."
 *
 * Implementation notes (design.md > Theme > Hero constellation):
 *   - No animation library. One requestAnimationFrame loop drives every node;
 *     animating plain SVG attributes on ~16 elements is cheap.
 *   - Coordinates are authored in a ~46 x 36 space and the viewBox matches that
 *     aspect ratio, so the composition fills its box instead of floating in
 *     letterboxed whitespace.
 *   - The resting state is fully legible on its own; interaction is additive.
 *   - `prefers-reduced-motion` disables drift but preserves the visual.
 *   - Decorative only: `aria-hidden`, not focusable, and it never traps clicks
 *     outside its own box.
 */

/** Authoring space for the composition. Matches the viewBox aspect ratio. */
const BOX_W = 46
const BOX_H = 38

/** A node in the constellation. Coordinates are in the authoring space. */
interface Node {
  x: number
  y: number
  /** Base radius in authoring units. */
  r: number
  /** Optional short label. Sparse on purpose — most nodes are unlabelled. */
  label?: string
  /**
   * Which side the label sits on. Defaults to 'right'. Nodes near the right
   * edge use 'left' so their label never runs past the viewBox.
   */
  labelSide?: 'left' | 'right'
}

/** A connection between two node indices. */
type Edge = [number, number]

/**
 * Hand-placed nodes forming a few loose clusters rather than a uniform field.
 *
 * Clusters (roughly):
 *   - upper-left:  AI / Learning
 *   - upper-right: Systems / React
 *   - lower-middle: LLMs / Data
 *   - a couple of satellite nodes bridging them
 *
 * Sizes vary; the larger nodes are the "important ideas" anchors.
 */
const NODES: Node[] = [
  // Upper-left cluster — AI / Learning
  { x: 7.5, y: 8.5, r: 0.72, label: 'AI' },
  { x: 14.5, y: 5.2, r: 0.5 },
  { x: 16.5, y: 12.8, r: 1.05, label: 'Learning' },
  { x: 9.0, y: 16.4, r: 0.58 },

  // Upper-right cluster — Systems / React
  { x: 29.5, y: 6.4, r: 0.64 },
  { x: 34.5, y: 9.8, r: 1.12, label: 'Systems' },
  { x: 30.5, y: 14.6, r: 0.55 },
  { x: 36.0, y: 16.8, r: 0.68, label: 'React' },

  // Bridge / centre
  { x: 23.5, y: 18.0, r: 0.86 },

  // Lower-middle cluster — LLMs / Data
  { x: 12.0, y: 24.5, r: 0.74 },
  { x: 19.0, y: 27.8, r: 1.15, label: 'LLMs' },
  { x: 27.5, y: 25.2, r: 0.6 },
  { x: 27.0, y: 31.4, r: 0.72, label: 'Data' },

  // Right-lower satellite
  { x: 35.0, y: 26.5, r: 0.95 },
  { x: 39.5, y: 22.0, r: 0.48 },
  { x: 34.5, y: 32.5, r: 0.54 },
]

/**
 * Connections, grouped by cluster. Deliberately partial: most nodes have one or
 * two links, and only a couple of edges cross between clusters. This produces
 * distinct constellations rather than a dense, technical-looking web.
 */
const EDGES: Edge[] = [
  // Upper-left cluster
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [0, 3],
  // Upper-right cluster
  [4, 5],
  [4, 6],
  [5, 6],
  [5, 7],
  [6, 8],
  // Lower cluster
  [9, 10],
  [10, 11],
  [9, 11],
  [11, 12],
  [11, 13],
  // Right-lower satellite
  [13, 14],
  [13, 15],
  [14, 15],
  // Cross-cluster bridges — intentionally few
  [3, 9],
  [8, 10],
  [7, 14],
  [2, 8],
]

/** Distance (authoring units) at which the cursor begins to matter. */
const INFLUENCE_RADIUS = 9
/** Maximum node displacement caused by the cursor, in authoring units. */
const MAX_PUSH = 1.7
/** Drift amplitude per node, in authoring units. Slow and small. */
const DRIFT_AMPLITUDE = 0.42
/** Resting opacity/radius multipliers, so the field is legible untouched. */
const BASE_NODE_OPACITY = 0.55
const BASE_EDGE_OPACITY = 0.32
const INFLUENCE_EDGE_BOOST = 0.45
/** Additive radius boost (authoring units) for a node under the cursor. */
const INFLUENCE_RADIUS_BOOST = 0.9
/** Gap between a node edge and its label. */
const LABEL_GAP = 1.1

/**
 * Compute a label's anchor point for a node at (cx, cy).
 *
 * Labels left of their node are end-anchored so the text grows leftwards,
 * keeping it inside the viewBox. Returns both the coordinates and the anchor
 * so the initial render and the animation loop cannot disagree.
 */
function labelPlacement(node: Node, cx: number, cy: number) {
  const left = node.labelSide === 'left'
  return {
    x: left ? cx - node.r - LABEL_GAP : cx + node.r + LABEL_GAP,
    y: cy + 0.9,
    anchor: (left ? 'end' : 'start') as 'end' | 'start',
  }
}

interface HeroConstellationProps {
  className?: string
}

export function HeroConstellation({ className }: HeroConstellationProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([])
  const labelRefs = useRef<(SVGTextElement | null)[]>([])
  const edgeRefs = useRef<(SVGLineElement | null)[]>([])
  /** Pointer position in authoring coordinates, or null when away. */
  const pointer = useRef<{ x: number; y: number } | null>(null)
  /** True while a mouse button or finger is down over the SVG. */
  const isDragging = useRef(false)
  /** 0–1 pulse that decays after a tap/swipe, adding a brief local highlight. */
  const pulse = useRef(0)

  /** Track the cursor / finger relative to the SVG box. */
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      // Mouse: follow hover movement, and mark an active drag while a button
      // is held. Touch: only tracked while the finger is down, which is
      // exactly when move events fire.
      if (event.pointerType === 'mouse' && event.buttons === 0) {
        pointer.current = {
          x: ((event.clientX - rect.left) / rect.width) * BOX_W,
          y: ((event.clientY - rect.top) / rect.height) * BOX_H,
        }
        return
      }

      pointer.current = {
        x: ((event.clientX - rect.left) / rect.width) * BOX_W,
        y: ((event.clientY - rect.top) / rect.height) * BOX_H,
      }
      // Keep a gentle trail while dragging/swiping.
      if (isDragging.current) {
        pulse.current = Math.max(pulse.current, 0.55)
      }
    },
    [],
  )

  /** Begin a drag/swipe. Also used for a tap highlight. */
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      isDragging.current = true
      pointer.current = {
        x: ((event.clientX - rect.left) / rect.width) * BOX_W,
        y: ((event.clientY - rect.top) / rect.height) * BOX_H,
      }
      // A tap (or the start of a swipe) briefly lights up the local area.
      pulse.current = 1

      // Capture so a swipe that leaves the SVG still releases cleanly.
      try {
        svg.setPointerCapture(event.pointerId)
      } catch {
        // Some browsers throw if the pointer is already gone; harmless.
      }
    },
    [],
  )

  const endInteraction = useCallback(() => {
    isDragging.current = false
  }, [])

  const handlePointerLeave = useCallback(() => {
    // Touch pointers "leave" as part of normal dragging; the explicit
    // up/cancel handlers are what actually end a touch interaction.
    if (isDragging.current) return
    pointer.current = null
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Live positions, tracked so labels and edges follow their node.
    const current = NODES.map((node) => ({ x: node.x, y: node.y }))

    let frame = 0
    let start: number | null = null

    const draw = (time: number | null) => {
      if (start === null && time !== null) start = time
      const t = time === null || start === null ? 0 : (time - start) / 1000
      const p = pointer.current

      // Decay the tap/swipe pulse. It fades over roughly a second so a tap
      // leaves a visible but brief trace rather than a flash.
      if (pulse.current > 0) {
        pulse.current = Math.max(0, pulse.current - (reduceMotion ? 0.08 : 0.016))
      }
      const pulseAmount = pulse.current

      // --- Nodes ---------------------------------------------------------
      NODES.forEach((node, index) => {
        // Per-node phase keeps the field from pulsing in unison.
        const phase = index * 1.37
        const driftX = reduceMotion
          ? 0
          : Math.sin(t * 0.19 + phase) * DRIFT_AMPLITUDE
        const driftY = reduceMotion
          ? 0
          : Math.cos(t * 0.14 + phase * 1.21) * DRIFT_AMPLITUDE

        let pushX = 0
        let pushY = 0
        let proximity = 0

        if (p) {
          const dx = node.x - p.x
          const dy = node.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < INFLUENCE_RADIUS) {
            // 1 at the cursor, easing to 0 at the influence edge, then
            // squared so the effect stays local rather than blanket-wide.
            proximity = 1 - dist / INFLUENCE_RADIUS
            const falloff = proximity * proximity
            // Nudge away from the cursor — the field is being disturbed.
            const safe = Math.max(dist, 0.0001)
            pushX = (dx / safe) * MAX_PUSH * falloff
            pushY = (dy / safe) * MAX_PUSH * falloff
          }
        }

        // A lingering tap/swipe highlight decays in place around the last
        // touched point, so touch input leaves a visible trace.
        if (pulseAmount > 0 && p) {
          const dist = Math.hypot(node.x - p.x, node.y - p.y)
          if (dist < INFLUENCE_RADIUS) {
            proximity = Math.max(
              proximity,
              (1 - dist / INFLUENCE_RADIUS) * pulseAmount,
            )
          }
        }

        const cx = node.x + driftX + pushX
        const cy = node.y + driftY + pushY
        current[index] = { x: cx, y: cy }

        const circle = nodeRefs.current[index]
        if (circle) {
          circle.setAttribute('cx', String(cx))
          circle.setAttribute('cy', String(cy))
          circle.setAttribute(
            'fill-opacity',
            String(BASE_NODE_OPACITY + proximity * (1 - BASE_NODE_OPACITY)),
          )
          circle.setAttribute(
            'r',
            String(node.r + proximity * INFLUENCE_RADIUS_BOOST),
          )
        }

        const label = labelRefs.current[index]
        if (label) {
          const placed = labelPlacement(node, cx, cy)
          label.setAttribute('x', String(placed.x))
          label.setAttribute('y', String(placed.y))
          label.setAttribute(
            'fill-opacity',
            String(0.62 + proximity * 0.38),
          )
        }
      })

      // --- Connections ----------------------------------------------------
      EDGES.forEach(([a, b], index) => {
        const line = edgeRefs.current[index]
        if (!line) return
        const from = current[a]
        const to = current[b]
        line.setAttribute('x1', String(from.x))
        line.setAttribute('y1', String(from.y))
        line.setAttribute('x2', String(to.x))
        line.setAttribute('y2', String(to.y))

        // Highlight by cursor distance to the nearest point on the segment,
        // so long edges respond along their whole length.
        let proximity = 0
        if (p) {
          const vx = to.x - from.x
          const vy = to.y - from.y
          const lenSq = vx * vx + vy * vy
          let tProj = 0
          if (lenSq > 0) {
            tProj = ((p.x - from.x) * vx + (p.y - from.y) * vy) / lenSq
            tProj = Math.max(0, Math.min(1, tProj))
          }
          const nearestX = from.x + vx * tProj
          const nearestY = from.y + vy * tProj
          const dist = Math.hypot(p.x - nearestX, p.y - nearestY)
          if (dist < INFLUENCE_RADIUS) {
            proximity = 1 - dist / INFLUENCE_RADIUS
          }
        }

        // Add the decaying tap/swipe highlight so connections reveal
        // themselves briefly after a touch, not only under a held cursor.
        if (pulseAmount > 0 && p) {
          const vx2 = to.x - from.x
          const vy2 = to.y - from.y
          const lenSq2 = vx2 * vx2 + vy2 * vy2
          let tProj2 = 0
          if (lenSq2 > 0) {
            tProj2 = ((p.x - from.x) * vx2 + (p.y - from.y) * vy2) / lenSq2
            tProj2 = Math.max(0, Math.min(1, tProj2))
          }
          const d2 = Math.hypot(
            p.x - (from.x + vx2 * tProj2),
            p.y - (from.y + vy2 * tProj2),
          )
          if (d2 < INFLUENCE_RADIUS) {
            proximity = Math.max(
              proximity,
              (1 - d2 / INFLUENCE_RADIUS) * pulseAmount,
            )
          }
        }
        line.setAttribute(
          'stroke-opacity',
          String(BASE_EDGE_OPACITY + proximity * INFLUENCE_EDGE_BOOST),
        )
        line.setAttribute(
          'stroke-width',
          String(0.14 + proximity * 0.1),
        )
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
      viewBox={`0 0 ${BOX_W} ${BOX_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className={className}
      /*
       * `pan-y` lets the page scroll vertically when a finger swipes over the
       * constellation, while still delivering the horizontal component to our
       * pointer handlers. `none` would trap the page scroll on mobile.
       */
      style={{ touchAction: 'pan-y' }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      onPointerLeave={handlePointerLeave}
    >
      {/* Connections */}
      <g
        fill="none"
        stroke="var(--color-border-strong)"
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
            strokeOpacity={BASE_EDGE_OPACITY}
            strokeWidth={0.14}
          />
        ))}
      </g>

      {/* Nodes */}
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
            fillOpacity={BASE_NODE_OPACITY}
          />
        ))}
      </g>

      {/* Labels sit above dots and lines */}
      <g
        fill="var(--color-tertiary)"
        style={{ fontSize: '1.55px', letterSpacing: '0.01em' }}
      >
        {NODES.map((node, index) => {
          if (!node.label) return null
          const placed = labelPlacement(node, node.x, node.y)
          return (
            <text
              key={index}
              ref={(el) => {
                labelRefs.current[index] = el
              }}
              x={placed.x}
              y={placed.y}
              textAnchor={placed.anchor}
              fillOpacity={0.62}
            >
              {node.label}
            </text>
          )
        })}
      </g>
    </svg>
  )
}
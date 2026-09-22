#!/usr/bin/env node
/**
 * Build-time blog discovery.
 *
 * Scans `blogs/` for lesson folders, reads each `metadata.json`, validates it,
 * and writes a single static manifest (`blogs/index.json`) that the React
 * gateway fetches at runtime.
 *
 * This is the ONLY place that knows about the repository's directory layout.
 * The browser never inspects the filesystem — it only reads the generated
 * manifest.
 *
 * Metadata model (do not invent extra required fields):
 *   title:    string
 *   authors:  string[]
 *   filename: string   -> which HTML file to open; never shown in the UI
 *   topic:    string[]
 *
 * Usage:
 *   node scripts/build-manifest.mjs
 *
 * Exit codes:
 *   0  manifest written (possibly with warned/skipped entries)
 *   1  fatal error (e.g. blogs/ missing, or no valid entries when some exist)
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

// This file lives at frontend/scripts/build-manifest.mjs, so the repo root is
// two levels up.
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const FRONTEND_DIR = path.resolve(SCRIPT_DIR, '..')
const REPO_ROOT = path.resolve(FRONTEND_DIR, '..')

const BLOGS_DIR = path.join(REPO_ROOT, 'blogs')
const MANIFEST_PATH = path.join(BLOGS_DIR, 'index.json')

/**
 * Public base path of the blog lessons, as seen from the built site.
 *
 * The manifest URL is absolute-from-site-root (`/blogs/<folder>/<file>`), which
 * matches how `blogs/` is served in the built output. `url` values are
 * resolved against the site root at runtime by the frontend.
 */
const PUBLIC_BLOG_BASE = '/blogs'

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

const log = (...args) => console.log('[blogs]', ...args)
const warn = (...args) => console.warn('[blogs] WARNING:', ...args)

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate one raw metadata object.
 *
 * Returns a list of human-readable problems. An empty list means valid.
 * Deliberately strict about types but tolerant about *content* — we never
 * substitute missing values, we just report them.
 */
function validateMetadata(raw) {
  const problems = []

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    problems.push('metadata is not a JSON object')
    return problems
  }

  // title: must exist and be a non-empty string
  if (typeof raw.title !== 'string') {
    problems.push('"title" must be a string')
  } else if (raw.title.trim() === '') {
    problems.push('"title" must not be empty')
  }

  // authors: must be an array of strings
  if (!Array.isArray(raw.authors)) {
    problems.push('"authors" must be an array')
  } else if (raw.authors.some((a) => typeof a !== 'string')) {
    problems.push('"authors" must contain only strings')
  }

  // filename: must exist and be a non-empty string
  if (typeof raw.filename !== 'string') {
    problems.push('"filename" must be a string')
  } else if (raw.filename.trim() === '') {
    problems.push('"filename" must not be empty')
  }

  // topic: must be an array of strings
  if (!Array.isArray(raw.topic)) {
    problems.push('"topic" must be an array')
  } else if (raw.topic.some((t) => typeof t !== 'string')) {
    problems.push('"topic" must contain only strings')
  }

  return problems
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function discoverBlogs() {
  const entries = await readdir(BLOGS_DIR, { withFileTypes: true })

  // Only real directories are candidate blogs. Files at the blogs/ root
  // (including our own index.json) are ignored.
  const folderNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  const articles = []
  const skipped = []

  for (const folderName of folderNames) {
    const metadataPath = path.join(BLOGS_DIR, folderName, 'metadata.json')

    if (!existsSync(metadataPath)) {
      skipped.push({ folder: folderName, reason: 'no metadata.json' })
      continue
    }

    let raw
    try {
      const text = await readFile(metadataPath, 'utf8')
      raw = JSON.parse(text)
    } catch (error) {
      skipped.push({
        folder: folderName,
        reason: `metadata.json is not valid JSON (${error.message})`,
      })
      continue
    }

    const problems = validateMetadata(raw)
    if (problems.length > 0) {
      skipped.push({ folder: folderName, reason: problems.join('; ') })
      continue
    }

    const filename = raw.filename.trim()

    // The referenced lesson file should exist. A missing file is a real
    // authoring mistake, so warn but still include the entry — the metadata
    // itself is valid, and reporting at build time is more useful than
    // silently dropping a valid blog.
    const lessonPath = path.join(BLOGS_DIR, folderName, filename)
    if (!existsSync(lessonPath)) {
      warn(
        `${folderName}: "filename" points to a missing file: ${filename} ` +
          `(expected at blogs/${folderName}/${filename})`,
      )
    }

    articles.push({
      title: raw.title.trim(),
      authors: raw.authors.map((a) => a.trim()).filter((a) => a !== ''),
      topic: raw.topic.map((t) => t.trim()).filter((t) => t !== ''),
      // Internal only. The frontend uses this to navigate and never renders it.
      url: `${PUBLIC_BLOG_BASE}/${folderName}/${filename}`,
      // Stable id derived from the folder, used as a React key.
      id: folderName,
    })

    log(`discovered "${raw.title.trim()}" (blogs/${folderName})`)
  }

  return { articles, skipped, folderCount: folderNames.length }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(BLOGS_DIR)) {
    console.error(`[blogs] ERROR: blogs directory not found at ${BLOGS_DIR}`)
    process.exitCode = 1
    return
  }

  const { articles, skipped, folderCount } = await discoverBlogs()

  // Report skipped entries clearly, without failing the whole build.
  for (const { folder, reason } of skipped) {
    warn(`skipped blogs/${folder}: ${reason}`)
  }

  if (articles.length === 0 && folderCount > 0) {
    // Every folder was invalid (or none contained metadata). Writing an empty
    // manifest would silently produce a blank gateway, so fail loudly instead.
    console.error(
      `[blogs] ERROR: found ${folderCount} folder(s) but produced 0 valid entries.`,
    )
    process.exitCode = 1
    return
  }

  // Sort for a stable, reviewable manifest: title, then id as a tiebreak.
  articles.sort(
    (a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id),
  )

  const manifest = {
    // Bumped when the manifest shape changes, so the frontend can detect
    // incompatible output rather than mis-rendering it.
    version: 1,
    generatedAt: new Date().toISOString(),
    articles,
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const skippedNote =
    skipped.length > 0 ? `, ${skipped.length} skipped` : ''
  log(
    `wrote ${path.relative(REPO_ROOT, MANIFEST_PATH)} ` +
      `(${articles.length} article${articles.length === 1 ? '' : 's'}${skippedNote})`,
  )
}

main().catch((error) => {
  console.error('[blogs] ERROR:', error)
  process.exitCode = 1
})
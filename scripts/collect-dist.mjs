#!/usr/bin/env node
/**
 * Collect the frontend build into a root-level `dist/`.
 *
 * The Vite app lives in `frontend/` but the host (Cloudflare Pages) is
 * configured with a single output directory. Rather than asking the host to
 * know about the nested layout, this moves `frontend/dist` to `./dist` after
 * the frontend build finishes.
 *
 * Run via the root `npm run build` script; not intended to be run directly.
 */

import { cpSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SOURCE = path.join(ROOT_DIR, 'frontend/dist')
const TARGET = path.join(ROOT_DIR, 'dist')

if (!existsSync(SOURCE)) {
  console.error(
    `[dist] ERROR: ${path.relative(ROOT_DIR, SOURCE)} not found. ` +
      'Did the frontend build run first?',
  )
  process.exitCode = 1
} else {
  // Start clean so stale files from a previous build never linger.
  rmSync(TARGET, { recursive: true, force: true })
  cpSync(SOURCE, TARGET, { recursive: true, force: true })
  console.log(`[dist] collected frontend/dist -> dist`)
}
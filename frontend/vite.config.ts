import { createReadStream, cpSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const FRONTEND_DIR = path.dirname(fileURLToPath(import.meta.url))
const BLOGS_DIR = path.resolve(FRONTEND_DIR, '../blogs')

/**
 * Copy `blogs/` into the build output.
 *
 * Vite only copies `public/`, and `blogs/` lives outside the frontend root, so
 * without this the deployed site would 404 on both `blogs/index.json` and every
 * lesson HTML file. Dev is unaffected because Vite serves this directory
 * directly (see `server.fs.allow` below).
 */
function copyBlogsPlugin(): Plugin {
  return {
    name: 'copy-blogs',
    apply: 'build',
    closeBundle() {
      if (!existsSync(BLOGS_DIR)) {
        this.warn(`blogs directory not found at ${BLOGS_DIR}; skipping copy`)
        return
      }
      // `blogs/` (including the generated index.json and every lesson) is
      // served verbatim from the site root, matching the manifest URLs.
      // `force: true` overwrites anything already present so repeat builds on
      // a dirty dist/ succeed. `preserveTimestamps` is left off because some
      // filesystems (e.g. FUSE/NTFS mounts) cannot apply chmod, which would
      // otherwise make cpSync throw.
      cpSync(BLOGS_DIR, path.resolve(FRONTEND_DIR, 'dist/blogs'), {
        recursive: true,
        force: true,
        // Dotfiles such as blogs/.gitignore are repo plumbing, not content.
        filter: (source) => !path.basename(source).startsWith('.'),
      })
    },
  }
}

/**
 * Serve the sibling `blogs/` directory during development.
 *
 * Vite's dev server only serves files inside the project root, so `/blogs/...`
 * requests (the manifest and every lesson HTML) would 404 without this. The
 * build path is handled by `copyBlogsPlugin` instead.
 */
function serveBlogsPlugin(): Plugin {
  return {
    name: 'serve-blogs',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (!url?.startsWith('/blogs/')) {
          next()
          return
        }

        // Resolve within blogs/ and reject anything that escapes it.
        const relative = decodeURIComponent(url.slice('/blogs/'.length))
        const filePath = path.resolve(BLOGS_DIR, relative)
        if (!filePath.startsWith(BLOGS_DIR) || !existsSync(filePath)) {
          next()
          return
        }

        const ext = path.extname(filePath)
        const types: Record<string, string> = {
          '.json': 'application/json',
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'text/javascript',
        }
        res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream')
        createReadStream(filePath).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Root-absolute base so generated `/blogs/...` URLs resolve on any host.
  // This project is deployed at a domain root, not a subpath.
  base: '/',
  plugins: [react(), tailwindcss(), serveBlogsPlugin(), copyBlogsPlugin()],
  server: {
    // Allow Vite's dev server to read the sibling `blogs/` directory.
    fs: { allow: [FRONTEND_DIR, BLOGS_DIR] },
  },
  publicDir: path.resolve(FRONTEND_DIR, 'public'),
})
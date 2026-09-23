# Ashmit and AI Writes

A small, personal library of interactive learning pages.

Each lesson is a self-contained interactive HTML page — something you read and
poke at rather than just scroll through. This repository holds those lessons and
a lightweight React gateway that presents them: a landing page with a search
box and a grid of cards, where clicking a card opens the lesson.

The gateway is deliberately boring. It has no backend, no database, no accounts,
and no server-side anything. It's a static site, which means it builds to a
folder of files and can be hosted anywhere for free.

---

## How it works

There are three moving parts, and they're kept separate on purpose.

### 1. Lessons are just folders

Every lesson lives in its own folder under `blogs/`:

```text
blogs/
└── some-topic/
    ├── metadata.json     # title, authors, filename, topic
    └── lesson.html       # the interactive page
```

A lesson folder can contain more than one HTML file — `metadata.json` points at
whichever one is the entry point via its `filename` field.

### 2. A build step turns folders into a manifest

The browser can't look inside a repository, so a small Node script does it at
build time instead:

```text
frontend/scripts/build-manifest.mjs
```

It walks `blogs/`, reads each `metadata.json`, checks that it looks sane, and
writes everything the frontend needs into a single file:

```text
blogs/index.json
```

That manifest is the only thing the app ever reads. The frontend has no idea
what the folder structure looks like — the script has already resolved each
lesson down to a ready-to-use URL.

The script is forgiving. If one lesson has a broken or missing `metadata.json`,
it prints a warning, skips that lesson, and carries on with the rest. If
*every* lesson is broken it fails loudly, because silently shipping an empty
library would be worse.

Because discovery happens at build time, adding a new lesson is just: drop in a
folder, rebuild. No frontend code changes.

### 3. The frontend renders what it's given

The React app (in `frontend/`) fetches the manifest, renders a card per lesson,
and filters them as you type in the search box. Search runs entirely in the
browser and matches against title, authors, and topics.

Clicking a card just navigates to the lesson's HTML page. Lessons don't know the
gateway exists — they're plain HTML files and will work fine opened directly.

---

## Project layout

```text
/
├── blogs/                  # the lessons (content lives here)
│   └── <topic>/
│       ├── metadata.json
│       └── <lesson>.html
├── frontend/               # the React gateway
│   ├── design.md           # the visual design system — read this before UI work
│   ├── scripts/
│   │   └── build-manifest.mjs
│   └── src/
├── scripts/
│   └── collect-dist.mjs    # moves the build output to the root for hosting
└── package.json            # top-level build/dev commands
```

`frontend/design.md` is the source of truth for anything visual: colours, type,
spacing, components. If you're changing the UI, start there.

---

## Working on it

Install the frontend dependencies once:

```bash
npm run install:frontend
```

Then, from the repository root:

```bash
npm run dev      # local dev server with hot reload
npm run build    # build the site into dist/
npm run preview  # serve the built site locally
npm run manifest # regenerate blogs/index.json on its own
```

`dev` and `build` regenerate the manifest automatically, so you rarely need to
run `manifest` by hand — it's there for when you just want to refresh the data.

### Adding a lesson

1. Create `blogs/<your-topic>/`.
2. Add your interactive HTML file.
3. Add a `metadata.json`:

```json
{
  "title": "Your Lesson Title",
  "authors": ["Your Name"],
  "filename": "your-lesson.html",
  "topic": ["Some Topic"]
}
```

4. Rebuild. The lesson shows up automatically.

All four fields are required. `filename` has to match the actual HTML file, and
`authors` and `topic` are always arrays, even when there's only one entry.

---

## Stack

- **React 19** with **TypeScript**, bundled by **Vite**
- **Tailwind CSS v4** for styling, configured through design tokens derived from `design.md`
- **Lucide React** for icons
- No animation library, no component library, no state management library

The build output is a static `dist/` folder: an `index.html`, hashed assets, and
a copy of `blogs/`. It needs to be hosted at a domain root, since the app and
manifest URLs are root-absolute.

---

## Deployment

Hosted on **Cloudflare Pages**, connected to this repository. Every push builds
and deploys automatically.

Configuration:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

The build runs from the repository root, which is why there's a top-level
`package.json` — it delegates to the frontend and then collects the result into
a root-level `dist/`.
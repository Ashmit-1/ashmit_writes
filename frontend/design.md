# Design System — Ashmit and AI Writes

This file defines the visual language for the **Ashmit and AI Writes** personal learning library: a lightweight, static gateway that presents interactive HTML learning pages stored in the same repository.

The product is intentionally simple. It is a reading/discovery interface, not a dashboard. The gateway should feel calm, editorial, modern, and fast, with enough personality to make the site feel authored rather than generated.

Read this document before touching UI code. The visual system is authoritative for the frontend. Content structure and discovery behavior should follow the repository's actual implementation.

---

## Implementation

* **React** for the gateway frontend.
* **Tailwind CSS** for layout, spacing, typography, and utilities.
* **Lucide React** for icons when an icon is genuinely useful.
* No UI component library is required. Prefer small native React components with Tailwind styling.
* No backend.
* The repository is the content source of truth.
* Interactive learning pages remain static HTML files and should be linked/opened directly.
* Use a **system sans stack** for the main UI:
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
* Use a restrained **serif stack** only for the `AI` part of the brand mark:
  `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`.
* Environment: **light-only**. There is no dark-mode toggle in this project.

### Content discovery

The gateway must not depend on a backend API or runtime directory browsing.

The implemented architecture is:

1. Lessons live under `blogs/<folder>/`, each with a `metadata.json` and one or more HTML files.
2. `frontend/scripts/build-manifest.mjs` scans `blogs/`, validates each `metadata.json`, and writes `blogs/index.json`.
3. The scan runs automatically before `dev` and `build` (via npm `predev` / `prebuild` scripts).
4. The React gateway fetches `/blogs/index.json` at runtime and renders from it.
5. The build copies `blogs/` into the output so the manifest and every lesson HTML resolve when deployed.

Responsibilities stay separate: the build script is the only thing that knows the repository layout; the manifest is the browser's only source of blog data; the frontend never touches the filesystem.

Metadata validation is defensive. An entry is skipped with a build-time warning if `title` is not a non-empty string, `authors` or `topic` is not an array of strings, or `filename` is not a non-empty string. A malformed entry must never break the gateway. If every folder is invalid, the build fails loudly rather than emitting an empty manifest.

The gateway must therefore remain a static site. Adding or removing a lesson requires no frontend code change — only the content folder.

### Build and deployment

The deployable artifact is a plain static directory:

* `npm run build` at the repository root builds the frontend and collects the result into a root-level `dist/`.
* `dist/` contains `index.html`, hashed assets, and a verbatim copy of `blogs/` (manifest plus every lesson).
* Asset and manifest URLs are root-absolute (`/assets/...`, `/blogs/index.json`), so the site must be hosted at a **domain root**, not a subpath. Deploying under a path prefix would require changing `base` in `vite.config.ts` and the public blog base in the build script.
* No server-side rendering, routing, or API is required. The site is a single page plus static lesson files.

Hosting (Cloudflare Pages) uses: build command `npm run build`, output directory `dist`, root directory `/`.

---

# Philosophy

The interface should feel like a personal, carefully edited knowledge shelf.

Use whitespace, typography, and alignment as the primary design tools. The page should feel polished without feeling like a SaaS dashboard.

The visual language is **warm minimalism**:

* mostly neutral surfaces,
* dark readable typography,
* one restrained accent color,
* subtle borders,
* very soft interaction states,
* no decorative complexity.

The home page should communicate three things immediately:

1. what this site is,
2. what can be explored,
3. how to find a topic quickly.

Avoid visual noise. Do not add sidebars, dashboards, statistics, category chrome, large illustrations, or unnecessary sections unless the project later acquires a real content need for them.

---

# Theme

### Base palette

* `page` — `#FAFAF8` — warm off-white page background.
* `surface` — `#FFFFFF` — cards, search field, elevated content.
* `surface-muted` — `#F5F5F2` — hover states and subtle grouped areas.
* `text-primary` — `#171717` — headings and important content.
* `text-secondary` — `#525252` — supporting content.
* `text-tertiary` — `#737373` — metadata and hints.
* `border` — `#E5E5E0` — default borders.
* `border-strong` — `#D4D4CF` — focused/stronger separation.
* `accent` — `#4F46E5` — primary interactive accent and the branded `AI` word.
* `accent-soft` — `#EEF2FF` — very subtle accent background where needed.

Ambient background tones (see Theme > Ambient background):

* `page-warm` — `#F4F1EA` — top of the page wash.
* `hero-from` — `#FDFCF9` — hero band gradient start.
* `hero-to` — `#F3EFE6` — hero band gradient end.

### Color rules

* The base interface remains neutral.
* `accent` is reserved for brand emphasis, links, focus, and primary interactive affordances.
* Do not use multiple accent colors.
* Avoid glassmorphism.
* Avoid neon colors.
* Avoid colored shadows.
* Avoid using color as the only way to communicate state.

### Ambient background

The page uses a restrained ambient background rather than a flat fill. This is the one sanctioned use of gradients; it exists to give the page depth and warmth, not decoration.

* **Page wash** — a warm-neutral gradient behind the whole page, running from `page-warm` into the flat `page` color. It must fade fully to `page` before the article grid so cards sit on a clean, flat surface.
* **Hero band** — the hero renders as its own distinct band with a warm gradient background (`hero-from` → `hero-to`), separated from the flat card area below.
* **Accent glow** — a single soft radial accent glow sits behind the search field in the article section. It stays low-contrast so `accent` remains an accent rather than a background color, but it should be clearly perceptible.
* **Paper grain** — a subtle noise texture (opacity ≈ 0.06–0.08) is layered over the washes so the gradients do not band or look synthetic.
* Ambient tones are additive tokens: `page-warm`, `hero-from`, `hero-to`. They must stay close to `page` in value so the effect reads as depth rather than a color change.

Gradient rules:

* Only warm-neutral gradients are permitted for surfaces.
* No multi-hue or "rainbow" gradients.
* No gradient text.
* Gradients must never reduce text contrast; all text must keep the contrast defined below.
* Decorative layers (glow, grain) are non-interactive and must not intercept pointer events.

### Hero constellation

The right side of the hero carries the **Thought Constellation**: a field of nodes representing ideas, grouped into loose clusters, some connected by hairlines. It drifts slowly on its own and responds to the cursor.

It exists to make the hero read as *a field of ideas waiting to be explored*. It is a major supporting element, not a small decoration — the hero should read as **typography + search ←→ constellation**.

**It must look intentionally designed at rest.** Do not make it so subtle that the area appears empty. Interaction is additive, never the thing that makes the visual legible.

* **Space** — on desktop it occupies roughly 40–45% of the hero width, vertically centred against the hero content, at approximately 450–550px wide by 350–450px tall. The composition fills its box; do not letterbox it into a fraction of the available area.
* **Responsive behaviour** — the constellation is present at **every** breakpoint; it is never hidden. It scales down and repositions rather than disappearing:
  * **Mobile** — sits in the hero's single column below the tagline at a reduced height (~240px), staying visible without crowding the hero or causing overflow.
  * **Tablet** — same placement, taller (~320px).
  * **Desktop** — moves into the right-hand column beside the typography, at full size.
  * Box dimensions track the viewBox aspect ratio at each breakpoint so the drawing fills its box, with no empty side margins and no horizontal overflow.
* **Touch** — interaction must not be mouse-only. On touch devices, dragging/swiping disturbs the nodes locally along the finger's path, and a tap leaves a brief highlight that fades. Vertical page scrolling must still work when a gesture starts on the constellation. Prefer a single pointer-event code path for both mouse and touch.
* **Nodes** — around 12–18, varying in size (roughly a 2–2.5x range), arranged organically. Never a grid, never uniform. Include roughly 3–5 noticeably larger "anchor" nodes for the important ideas.
* **Composition** — a few loose clusters rather than a uniform field. Most nodes connect to one or two others; only a small number of edges cross between clusters. It should read as a map of ideas, not a mesh.
* **Labels** — a handful of very short, quiet labels (`AI`, `Learning`, `Systems`, `React`, `LLMs`, `Data`, …). Sparse: most nodes are unlabelled. Labels use the metadata tone (`text-tertiary`), must stay inside the viewBox, and must not collide with other nodes or labels. They are not navigation or controls.
* **Connections** — thin hairlines (about 1–2px on screen) at low resting opacity, suggesting relationships. Avoid dense webs, hubs, or anything resembling a technical graph, neural network, or blockchain diagram.
* **Resting state** — nodes and connections must be clearly visible before any interaction. Opacity is not the thing that carries the whole visual.
* **Motion** — very slow ambient drift (a few pixels at most), with per-node phase so the field never pulses in unison. No bouncing, no parallax, no particle effects.
* **Cursor response** — a *local* effect: within roughly 100–110px of the pointer, nodes shift slightly away, brighten, and grow, and connections become more visible. Outside that radius the field stays calm. Keep displacement restrained (tens of pixels at most, not a chase). Connections should respond along their length, not only near their midpoint.
* **Palette** — neutral (`secondary` / `tertiary` / `border-strong`). This is not a place for the accent color, gradients, or neon.
* **Hierarchy** — typography stays primary. The constellation must never compete with the tagline.
* **Reduced motion** — `prefers-reduced-motion` disables drift while preserving the visual in its resting state.
* **Performance** — the animation must stay cheap on mobile: one animation loop, direct attribute updates, no libraries.
* **Accessibility** — purely decorative: `aria-hidden`, not focusable, and it must not interfere with surrounding content.

This visual must not become a generic "AI" graphic. No brains, sparks, glowing orbs, neural-network icons, or animated particles.

### Shadows

Use very little shadow.

Cards should primarily use a border. A faint shadow may be used for small floating elements such as a command/search suggestion panel, but the default card state has no visible shadow. Shadows stay neutral; no colored (accent-tinted) shadows.

---

# Branding

## Wordmark

The main brand text is:

**Ashmit and AI Writes**

The exact visual treatment should be:

* `Ashmit and` — system sans, medium/semibold.
* `AI` — serif, slightly italic or distinctive weight, rendered in the single accent color.
* `Writes` — system sans, medium/semibold.

The difference should feel editorial rather than promotional. `AI` is the only part of the wordmark that intentionally breaks the typography system.

Do not add an icon or logo mark unless a later product need requires one.

## Tagline

The phrase **"Ashmit and AI Writes"** functions as the primary identity and hero heading, not a tiny navbar logo.

The landing page should give it generous breathing room and make it the first strong typographic element after the page chrome.

---

# Typography

Use a small type scale with strong hierarchy.

* **Hero / brand heading:** `text-4xl` to `text-6xl`, responsive, semibold.
* **Section heading:** `text-lg` to `text-xl`, semibold.
* **Article title:** `text-lg` to `text-xl`, semibold.
* **Body:** `text-sm` to `text-base`, regular.
* **Metadata:** `text-xs` to `text-sm`, regular/medium.
* **Search placeholder:** `text-sm`.

Prefer `font-medium` or `font-semibold`; avoid heavy bold unless required for emphasis.

Use comfortable line height. Titles should not feel cramped.

The serif font is reserved for `AI` in the brand and may be reused very sparingly for small editorial emphasis. Do not turn the entire interface into a serif design.

---

# Layout

## Page structure

The site should have one main gateway page and then the static lesson pages.

### Gateway

1. **Top bar**
   * small, clean wordmark treatment;
   * no complex navigation;
   * optional minimal GitHub/source link if a real link is added later.
2. **Hero band**
   * renders as its own full-width band with a warm gradient background (see Theme > Ambient background);
   * brand heading: `Ashmit and AI Writes`;
   * one short supporting sentence explaining that this is a collection of interactive learning pages;
   * the **Thought Constellation** occupies the right side on desktop and sits below the tagline on smaller screens (see Theme > Hero constellation);
   * a subtle hairline rule closing the bottom of the band;
   * the hero contains no search field — it is purely identity and orientation.
3. **Article section**
   * sits on the flat `page` color below the band;
   * a **centered search field** above the grid, with the soft accent glow behind it. The search belongs to this section because it filters these articles;
   * section heading such as `Explore` or `Learn`;
   * responsive card grid immediately below the search, with only a reasonable gap.
   * Keep this section compact: on desktop the search field and the first row of cards should both be visible within a normal viewport where practical. Avoid stacked padding and margins that push the first row of cards below the fold.
4. **Empty/search state**
   * calm message when no article matches the search.

Do not create a footer-heavy layout. A very small footer is enough if one is needed.

## Container

Use a centered content container with generous horizontal padding.

Target widths:

* mobile: nearly full width with `16px` side padding;
* tablet: `24px` side padding;
* desktop: `32px` side padding;
* maximum content width around `1100px`–`1200px`.

The content should not stretch across the entire screen on large displays.

## Vertical rhythm

Use a restrained 8px spacing system.

Common values:

`8, 12, 16, 24, 32, 48, 64, 80`

The hero should carry generous spacing, but the article section below it must stay compact enough that the search field and the first row of cards are reachable without a large scroll. Cards should have comfortable internal padding without becoming oversized.

---

# Search

Search is a first-class interaction because the library is expected to grow.

### Placement

The search field lives in the **article section**, not the hero:

* horizontally centered above the article grid, within the content container;
* full width on phones (the content area is narrower than any sensible cap there) and capped at roughly `max-w-2xl` from tablet up, where centering becomes visible;
* it belongs to the section it filters — the hero stays identity-only;
* only a small gap separates it from the first row of cards.

### Search field

* white surface;
* subtle border;
* rounded `10px`–`12px` corners;
* visible but restrained focus ring using the accent color;
* search icon on the left;
* clear button on the right when text is present;
* no unnecessary filters in the first version.

### Search behavior

At minimum, search should match against:

* article title;
* author names;
* topics.

The lesson `filename` and folder name are not part of the search model.

Search should update results immediately as the user types. There is no need for a server-side search API.

Keep the search logic simple and case-insensitive. Avoid fuzzy-search dependencies unless the dataset later becomes large enough to justify one.

---

# Article Cards

Cards are the main content component on the gateway.

### Card structure

Each card should contain exactly the useful basics:

1. **Article title** — strongest text on the card.
2. **Authors** — show all authors from metadata, joined with a middot (`Ashmit Das · Deepseek AI`).
3. **Topics** — show every topic from metadata as small quiet chips.
4. **Small affordance** — a subtle `Open` / arrow treatment, or simply make the full card clickable.

Do not add fake metadata such as reading time, category, views, likes, progress, or difficulty unless those fields are actually introduced later.

Never display the lesson `filename` or the folder name — they are implementation detail, not content.

### Topic treatment

Topics are the one place a card may use the `accent-soft` surface. Keep them quiet:

* small text (`text-xs`) in a `rounded-md` chip;
* `accent-soft` background with a `border` outline;
* they wrap naturally and never overflow the card;
* they are labels, not controls — do not wire up click behavior for them in the first version.

Do not let chips multiply into a badge wall: the title stays the dominant element, and authors stay plain text rather than chips.

### Card styling

* white background;
* `1px` border using `border`;
* `rounded-xl` corners;
* no shadow at rest;
* slightly darker background or stronger border on hover;
* very subtle upward movement is acceptable, but keep it to approximately `1–2px`;
* transition duration around `150–200ms`.

Cards should feel tactile but quiet.

### Card grid

* mobile: 1 column;
* medium screens: 2 columns;
* large screens: 3 columns when there is enough width.

Do not force three columns on narrow desktops.

### Click behavior

Clicking a card should open the corresponding interactive HTML lesson.

The lesson page itself should remain independent from the React gateway.

---

# Metadata

The metadata model is intentionally small and lives beside each lesson as
`blogs/<folder>/metadata.json`:

```text
title: string
authors: string[]
filename: string
topic: string[]
```

A build-time discovery step reads these files and generates a static manifest
(see Content discovery). The browser consumes the manifest and never inspects
the repository.

The UI must gracefully handle:

* multiple authors;
* an empty authors array;
* an empty topic array;
* unexpectedly long titles.

Do not invent additional required metadata fields.

`filename` selects which HTML file to open. It is used only to construct the
lesson URL (`/blogs/<folder>/<filename>`) and must never be displayed on a card
or matched by search — the folder name is likewise internal.

---

# Empty, Loading, and Error States

The first version should stay simple.

### Loading

Use a small neutral skeleton or understated loading treatment. Avoid flashy spinners.

### No articles

Show a centered message such as:

`No articles yet.`

Keep it visually quiet.

### No search results

Show a clear message such as:

`No articles match “query”.`

Also provide a simple way to clear the search.

### Manifest/content error

If the static manifest cannot be loaded, show a calm, readable error state explaining that the article library could not be loaded.

Do not expose technical stack traces to the user.

---

# Buttons and Links

Prefer links when the user is navigating to a lesson. Use buttons for actual actions such as clearing search.

### Primary interactive treatment

* accent text and/or accent border;
* accent focus ring;
* white background by default where possible;
* avoid creating a fully saturated button-heavy interface.

### Secondary actions

Use neutral text, subtle borders, or transparent surfaces.

All interactive elements should have:

* clear hover state;
* visible keyboard focus state;
* disabled treatment where appropriate.

---

# Icons

Use Lucide React only where an icon improves recognition.

Good candidates:

* Search
* ArrowUpRight / ArrowRight for opening an article
* X for clearing search
* Github for an optional source link

Do not use icons as decoration next to every piece of metadata.

---

# Motion

Motion should reinforce interaction rather than attract attention.

* 150–200ms transitions.
* Small hover elevation only.
* No large page transitions.
* No bouncing.
* No parallax.
* Respect `prefers-reduced-motion`.
* The hero constellation is the one place continuous ambient motion is allowed, and it must stay slow and small (see Theme > Hero constellation).

---

# Responsive Design

The gateway must work comfortably on phones, tablets, laptops, and large desktops.

### Mobile

* one-column article list;
* hero heading scales down gracefully;
* the search field sits at the top of the article section, full width on phones and centered from tablet up;
* the hero constellation is scaled down and placed below the tagline, so it stays visible without crowding the hero or causing overflow;
* cards retain comfortable padding;
* no horizontal scrolling;
* top navigation remains minimal.

### Desktop

* centered constrained content;
* larger hero spacing;
* two- or three-column card grid;
* card heights should align naturally without artificial fixed heights.

---

# Accessibility

* Use semantic headings and landmarks.
* Search input must have an accessible label, even if the visual UI uses only a placeholder.
* Cards that act as links must be keyboard accessible.
* Do not rely on color alone for interactive states.
* Maintain strong contrast between primary text and the background.
* Focus states must remain visible.
* Respect reduced-motion preferences.
* Long titles and author names must wrap cleanly rather than overflow.

---

# Design Rules

## Do

* Keep the gateway light, calm, and editorial.
* Let typography and whitespace create hierarchy.
* Keep the palette mostly neutral.
* Use one restrained accent color.
* Make search obvious and easy to use.
* Keep cards focused on title, authors, and topics.
* Make the full card or a clear link open the interactive lesson.
* Keep the gateway independent from the lesson HTML.
* Make the layout responsive from the beginning.
* Keep the implementation simple enough for a static deployment.

## Don't

* Do not introduce a backend.
* Do not add authentication.
* Do not create a dashboard/sidebar layout.
* Do not add categories, tags, likes, views, comments, or reading progress unless the content model later gains those fields. (Topics are part of the content model and are shown as quiet chips — they are not category chrome.)
* Do not introduce multiple accent colors.
* Do not use gradients except the sanctioned ambient background washes described in Theme > Ambient background.
* Do not add gradient text, multi-hue gradients, or colored shadows.
* Do not use glassmorphism or decorative effects.
* Do not let gradients compete with content: text surfaces (cards, search field) stay solid `surface`.
* Do not make every card visually identical through excessive badges and metadata.
* Do not hard-code individual article cards in React.
* Do not require a frontend code change whenever a new lesson is added.
* Do not duplicate the lesson HTML inside the gateway application.

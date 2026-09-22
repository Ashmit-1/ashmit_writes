/**
 * TEMPORARY PLACEHOLDER DATA — NOT REAL ARTICLES.
 *
 * ---------------------------------------------------------------------------
 * These entries exist only to demonstrate the landing-page card layout in this
 * foundation step. They are NOT derived from the `blogs/` directory and they
 * deliberately do not describe real content.
 *
 * WHEN ARTICLE DISCOVERY LANDS:
 *   1. Delete this file.
 *   2. Point `useArticleLibrary` (src/hooks/useArticleLibrary.ts) at the real
 *      static manifest (e.g. `blogs/index.json`).
 *
 * No article card is hard-coded in JSX — the grid maps over a list, so
 * removing this file requires no UI changes.
 * ---------------------------------------------------------------------------
 */

import type { Article } from '../types'

/** Marks the fixture below as demo content so it is obvious at a glance. */
export const IS_DEMO_DATA = true

export const DEMO_ARTICLES: Article[] = [
  {
    id: 'demo-1',
    name: 'Placeholder: Understanding Attention',
    authors: ['Ashmit'],
    date: '2026-01-12',
    href: '#',
  },
  {
    id: 'demo-2',
    name: 'Placeholder: A Gentle Introduction to Embeddings',
    authors: ['Ashmit', 'AI'],
    date: '2026-02-03',
    href: '#',
  },
  {
    id: 'demo-3',
    name: 'Placeholder: Building a Tiny Language Model',
    authors: ['Ashmit'],
    date: '2026-03-21',
    href: '#',
  },
  {
    id: 'demo-4',
    name: 'Placeholder: Reasoning, Step by Step',
    authors: ['AI'],
    date: '2026-04-14',
    href: '#',
  },
  {
    id: 'demo-5',
    name: 'Placeholder: Retrieval Without the Buzzwords',
    authors: [],
    date: '',
    href: '#',
  },
  {
    id: 'demo-6',
    name: 'Placeholder: An Extremely Long Article Title That Demonstrates How Titles Wrap Cleanly Instead of Overflowing the Card',
    authors: ['Ashmit', 'AI', 'A Very Long Co-Author Name That Should Still Wrap'],
    date: '2026-05-30',
    href: '#',
  },
]
// app/config/projects.ts

export interface ScreenImage {
  src: string
  width: number
  height: number
}

export interface Project {
  slug: string
  title: string
  /** One‐sentence summary for list views */
  summary: string
  /** Full Markdown description for the project detail page */
  body?: string
  hero: string
  heroWidth: number
  heroHeight: number
  thumbLg: string
  thumbLgWidth: number
  thumbLgHeight: number
  thumb: string
  thumbWidth: number
  thumbHeight: number
  screens?: ScreenImage[]
  og?: string
  ogWidth?: number
  ogHeight?: number
  /** Optional code snippets to render in a Snippet component */
  codeSnippets?: string[]
}

const projects: Project[] = [
  {
    slug: 'craig-watt-website',
    title: 'craigwatt.co.uk Web App',
    summary: 'My personal site built on Next.js, Tailwind, and HeroUI.',
    body: `
## Overview

This is the very site you’re browsing! It’s built with:
- **Next.js App Router** for fast page loads  
- **Tailwind CSS** + HeroUI for styling & components  
- **Markdown-driven** blog & projects

### Highlights

- Dark-mode toggle that persists in localStorage  
- Responsive grid layout for projects & posts  
- Syntax-highlighted code snippets with HeroUI’s \`<Snippet />\`  
`,
    hero: '/images/projects/craig-watt-website/craig-watt-website1-hero.webp',
    heroWidth: 1800,
    heroHeight: 600,
    thumbLg: '/images/projects/craig-watt-website/craig-watt-website1-thumb-lg.webp',
    thumbLgWidth: 900,
    thumbLgHeight: 600,
    thumb: '/images/projects/craig-watt-website/craig-watt-website1-thumb.webp',
    thumbWidth: 640,
    thumbHeight: 360,
    screens: [
      {
        src: '/images/projects/craig-watt-website/craig-watt-website2-screen-1.webp',
        width: 1200,
        height: 675,
      },
    ],
    og: '/images/projects/craig-watt-website/craig-watt-website-og.webp',
    ogWidth: 1200,
    ogHeight: 630,
    codeSnippets: [
      `// Example: Hello World in JS
console.log('Hello, World!');`,
      `// NotFound component
export default function NotFound() {
  return (
    <main className=\"min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white\">
      <h1 className=\"text-6xl font-bold\">404</h1>
      <p className=\"mt-4 text-lg\">This page could not be found.</p>
    </main>
  )
}`
    ],
  },
  {
    slug: 'vfo',
    title: 'vfo – Video File Organizer',
    summary: 'Batch-encode your video portfolio with smart defaults.',
    body: `
## What is vfo?

vfo is a CLI tool that:
1. **PXE-boots** a custom initramfs to attach SSDs  
2. **Scans** each video’s metadata  
3. **Applies** frame-rate and bitrate heuristics

### v0.2.0 features

- 🎥 Auto-detect frame-rate  
- 📐 Choose bitrate by resolution  
- 📊 Report detailed stats to console  
`,
    hero: '/images/projects/vfo/vfo_diagram1-hero.webp',
    heroWidth: 1800,
    heroHeight: 600,
    thumbLg: '/images/projects/vfo/vfo_diagram1-thumb-lg.webp',
    thumbLgWidth: 900,
    thumbLgHeight: 600,
    thumb: '/images/projects/vfo/vfo_diagram1-thumb.webp',
    thumbWidth: 640,
    thumbHeight: 360,
    screens: [
      {
        src: '/images/projects/vfo/vfo_diagram2-screen-1.webp',
        width: 1200,
        height: 675,
      },
    ],
    og: '/images/projects/vfo/vfo_diagram1-og.webp',
    ogWidth: 1200,
    ogHeight: 630,
    codeSnippets: [
      `# Example: Hello World in Bash
echo "Hello, World!"`,
      `// NotFound component
export default function NotFound() {
  return (
    <main className=\"min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white\">
      <h1 className=\"text-6xl font-bold\">404</h1>
      <p className=\"mt-4 text-lg\">This page could not be found.</p>
    </main>
  )
}`
    ],
  },
]

export default projects

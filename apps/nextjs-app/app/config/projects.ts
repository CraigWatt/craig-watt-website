// app/config/projects.ts

export interface ScreenImage {
  src: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  hero: string; // e.g. '/images/projects/project-a/project-a-hero.webp'
  heroWidth: number; // true pixel width of hero, e.g. 1800
  heroHeight: number; // true pixel height of hero, e.g. 600
  thumbLg: string; // e.g. '/images/projects/project-a/project-a-thumb-lg.webp'
  thumbLgWidth: number; // e.g. 900
  thumbLgHeight: number; // e.g. 600
  thumb: string; // e.g. '/images/projects/project-a/project-a-thumb.webp'
  thumbWidth: number; // e.g. 640
  thumbHeight: number; // e.g. 360
  screens?: ScreenImage[]; // optional array of additional screenshots
  og?: string; // optional '/images/projects/project-a/project-a-og.webp'
  ogWidth?: number; // e.g. 1200
  ogHeight?: number; // e.g. 630
  codeSnippets?: string[]; // optional array of code snippets
}

const projects: Project[] = [
  {
    slug: 'project-a',
    title: 'Project A',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    hero: '/images/projects/project-a/project-a-hero.webp',
    heroWidth: 1800,
    heroHeight: 600,
    thumbLg: '/images/projects/project-a/project-a-thumb-lg.webp',
    thumbLgWidth: 900,
    thumbLgHeight: 600,
    thumb: '/images/projects/project-a/project-a-thumb.webp',
    thumbWidth: 640,
    thumbHeight: 360,
    screens: [
      {
        src: '/images/projects/project-a/project-a-screen-1.webp',
        width: 1200,
        height: 675,
      },
    ],
    og: '/images/projects/project-a/project-a-og.webp',
    ogWidth: 1200,
    ogHeight: 630,
    codeSnippets: [],
  },
  {
    slug: 'vfo',
    title: 'vfo - Video File Organizer',
    description: `
A utility for batch-encoding your video portfolio. Think HandBrake queue but with decision-making built in.

vfo will scan every video file individually and make encoding decisions based on the quality of that particular video.

v0.2.0 spec:
- 🎥 auto-detect frame-rate
- 📐 auto-choose bitrate by resolution
- 📊 report stats to console
    `.trim(),
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
    codeSnippets: [],
  },
];

export default projects;

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
}

const projects: Project[] = [
  {
    slug: 'project-a',
    title: 'Project A',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
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
      // add more screens as needed
    ],
    og: '/images/projects/project-a/project-a-og.webp',
    ogWidth: 1200,
    ogHeight: 630,
  },
  {
    slug: 'project-b',
    title: 'Project B',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    hero: '/images/projects/project-b/project-b-hero.webp',
    heroWidth: 1800,
    heroHeight: 600,
    thumbLg: '/images/projects/project-b/project-b-thumb-lg.webp',
    thumbLgWidth: 900,
    thumbLgHeight: 600,
    thumb: '/images/projects/project-b/project-b-thumb.webp',
    thumbWidth: 640,
    thumbHeight: 360,
    screens: [
      {
        src: '/images/projects/project-b/project-b-screen-1.webp',
        width: 1200,
        height: 675,
      },
      // etc.
    ],
    og: '/images/projects/project-b/project-b-og.webp',
    ogWidth: 1200,
    ogHeight: 630,
  },
  {
    slug: 'project-c',
    title: 'Project C',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    hero: '/images/projects/project-c/project-c-hero.webp',
    heroWidth: 1800,
    heroHeight: 600,
    thumbLg: '/images/projects/project-c/project-c-thumb-lg.webp',
    thumbLgWidth: 900,
    thumbLgHeight: 600,
    thumb: '/images/projects/project-c/project-c-thumb.webp',
    thumbWidth: 640,
    thumbHeight: 360,
    screens: [
      {
        src: '/images/projects/project-c/project-c-screen-1.webp',
        width: 1200,
        height: 675,
      },
      // etc.
    ],
    og: '/images/projects/project-c/project-c-og.webp',
    ogWidth: 1200,
    ogHeight: 630,
  },
  // …add more projects…
];

export default projects;

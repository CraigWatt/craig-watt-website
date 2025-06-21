export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  thumb: string;
  thumbLg?: string;
  hero?: string;
  og?: string;
  readingTime?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

const posts: Post[] = [
  {
    slug: 'intro-to-observability',
    title: 'Introduction to Observability',
    date: '2025-06-01',
    excerpt: 'Why metrics, logs, and traces matter for reliable services…',
    thumb: `/images/blog/intro-to-observability/intro-to-observability-thumb.webp`,
    thumbLg: `/images/blog/intro-to-observability/intro-to-observability-thumb-lg.webp`,
    hero: `/images/blog/intro-to-observability/intro-to-observability-hero.webp`,
    og: `/images/blog/intro-to-observability/intro-to-observability-og.webp`,
    readingTime: '6 min read',
    category: 'Tech',
    tags: ['monitoring', 'logging', 'tracing'],
    author: 'Craig Watt',
  },
  {
    slug: 'k3s-on-raspberry-pi',
    title: 'Running k3s on Raspberry Pi',
    date: '2025-05-15',
    excerpt: 'A step-by-step guide to your own self-hosted mini-cluster…',
    thumb: `/images/blog/k3s-on-raspberry-pi/k3s-on-raspberry-pi-thumb.webp`,
    thumbLg: `/images/blog/k3s-on-raspberry-pi/k3s-on-raspberry-pi-thumb-lg.webp`,
    hero: `/images/blog/k3s-on-raspberry-pi/k3s-on-raspberry-pi-hero.webp`,
    og: `/images/blog/k3s-on-raspberry-pi/k3s-on-raspberry-pi-og.webp`,
    readingTime: '8 min read',
    category: 'Tech',
    tags: ['k3s', 'raspberry-pi', 'self-hosting'],
    author: 'Craig Watt',
  },
  {
    slug: 'slow-cooker-chili',
    title: 'Slow Cooker Chili Recipe',
    date: '2025-06-10',
    excerpt: 'A hearty slow-cooker chili perfect for busy weeknights…',
    thumb: `/images/blog/slow-cooker-chili/slow-cooker-chili-thumb.webp`,
    thumbLg: `/images/blog/slow-cooker-chili/slow-cooker-chili-thumb-lg.webp`,
    hero: `/images/blog/slow-cooker-chili/slow-cooker-chili-hero.webp`,
    og: `/images/blog/slow-cooker-chili/slow-cooker-chili-og.webp`,
    readingTime: '5 min read',
    category: 'Cooking',
    tags: ['chili', 'slow-cooker', 'comfort food'],
    author: 'Craig Watt',
  },
  // …other posts
];

export default posts;

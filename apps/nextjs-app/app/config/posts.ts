// app/config/posts.ts

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO date string, e.g. "2025-06-01"
  excerpt: string; // Short summary for card listing

  // Paths to images under /public/images/blog/...
  // Ensure you generate these via your Sharp script (e.g., “slug-thumb.webp”, “slug-hero.webp”, “slug-og.webp”).
  thumb: string; // e.g. "/images/blog/intro-to-observability-thumb.webp"
  hero?: string; // e.g. "/images/blog/intro-to-observability-hero.webp" (used on detail page)
  og?: string; // e.g. "/images/blog/intro-to-observability-og.webp" (optional social preview)

  // Optional metadata for cards/detail
  category?: string; // e.g. "Observability", "K3s", etc.
  readingTime?: string; // e.g. "5 min read", you can compute or hardcode
  tags?: string[]; // optional array of tags
}

const posts: Post[] = [
  {
    slug: 'intro-to-observability',
    title: 'Introduction to Observability',
    date: '2025-06-01',
    excerpt: 'Why metrics, logs, and traces matter for reliable services…',
    thumb: '/images/blog/intro-to-observability-thumb.webp',
    hero: '/images/blog/intro-to-observability-hero.webp',
    og: '/images/blog/intro-to-observability-og.webp',
    category: 'Observability',
    readingTime: '6 min read',
    tags: ['monitoring', 'logging', 'tracing'],
  },
  {
    slug: 'k3s-on-raspberry-pi',
    title: 'Running k3s on Raspberry Pi',
    date: '2025-05-15',
    excerpt: 'A step-by-step guide to your own self-hosted mini-cluster…',
    thumb: '/images/blog/k3s-on-raspberry-pi-thumb.webp',
    hero: '/images/blog/k3s-on-raspberry-pi-hero.webp',
    og: '/images/blog/k3s-on-raspberry-pi-og.webp',
    category: 'Kubernetes',
    readingTime: '8 min read',
    tags: ['k3s', 'raspberry-pi', 'self-hosting'],
  },
  // Add more posts here...
];

export default posts;

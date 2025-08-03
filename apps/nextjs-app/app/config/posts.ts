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
  codeSnippets?: string[]
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
    codeSnippets: [
      `// Example A: Initialize a basic counter metric
import client from 'prom-client'
const requestCount = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
})
requestCount.inc()`,
      `// Example B: Track histogram of response durations
const responseTime = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  buckets: [0.1, 0.5, 1, 2.5, 5, 10],
})
responseTime.observe(0.42)`,
      `// Example C: Expose metrics endpoint
import express from 'express'
const app = express()
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.send(await client.register.metrics())
})
app.listen(3000)`,
    ],
  },
  {
    slug: 'raspberry-pi-pxe-netboot-initramfs',
    title: 'raspberry-pi-pxe-netboot-initramfs',
    date: '2025-05-15',
    excerpt: 'A step-by-step guide to your own self-hosted mini-cluster…',
    thumb: `/images/blog/raspberry-pi-pxe-netboot-initramfs/k3s-on-raspberry-pi-thumb.webp`,
    thumbLg: `/images/blog/raspberry-pi-pxe-netboot-initramfs/k3s-on-raspberry-pi-thumb-lg.webp`,
    hero: `/images/blog/raspberry-pi-pxe-netboot-initramfs/k3s-on-raspberry-pi-hero.webp`,
    og: `/images/blog/raspberry-pi-pxe-netboot-initramfs/k3s-on-raspberry-pi-og.webp`,
    readingTime: '8 min read',
    category: 'Tech',
    tags: ['k3s', 'raspberry-pi', 'self-hosting'],
    author: 'Craig Watt',
    codeSnippets: [
      `# Example 1: Install k3s on a single Pi
curl -sfL https://get.k3s.io | sh -`,
      `# Example 2: Check cluster status
sudo k3s kubectl get nodes`,
    ],
  },
  {
    slug: 'slow-cooker-chili',
    title: 'Slow Cooker Chili Recipe',
    date: '2025-06-10',
    excerpt: 'A hearty slow-cooker chili perfect for busy weeknights…',
    thumb: `/images/blog/slow-cooker-chili/slow-cooker-thumb.webp`,
    thumbLg: `/images/blog/slow-cooker-chili/slow-cooker-thumb-lg.webp`,
    hero: `/images/blog/slow-cooker-chili/slow-cooker-hero.webp`,
    og: `/images/blog/slow-cooker-chili/slow-cooker-og.webp`,
    readingTime: '5 min read',
    category: 'Cooking',
    tags: ['chili', 'slow-cooker', 'comfort food'],
    author: 'Craig Watt',
    codeSnippets: [
      `// Example: Set slow cooker to low and cook for 8 hours
slowCooker.setTemperature('low')
slowCooker.setTimer(8 * 60 * 60)`
    ],
  },
  // …other posts
];

export default posts;

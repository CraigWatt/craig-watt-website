import type { Metadata } from 'next';
import { buildPageMetadata } from '../config/metadata';
import { BlogPageClient } from './BlogPageClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Writing',
  description:
    'Technical notes, project write-ups, observability lessons, and the occasional recipe from Craig Watt.',
  path: '/blog',
});

export default function BlogPage() {
  return <BlogPageClient />;
}

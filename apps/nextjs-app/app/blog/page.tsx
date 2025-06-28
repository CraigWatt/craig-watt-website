// apps/nextjs-app/app/blog/page.tsx
export const dynamic = 'force-dynamic'; // disable static prerender

import { Suspense } from 'react';
import posts from '../config/posts';
import BlogListClient from './BlogList.client';

export default function BlogPage() {
  return (
    <main className="py-16 px-4 md:px-6 space-y-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center">Blog</h1>

      {/* Wrap the client component in Suspense so useSearchParams is allowed */}
      <Suspense fallback={<div>Loading posts…</div>}>
        <BlogListClient posts={posts} />
      </Suspense>
    </main>
  );
}

// app/blog/page.tsx
import posts from '../config/posts';
import BlogListClient from './BlogList.client';

export default function BlogPage() {
  return (
    <main className="py-16 px-4 md:px-6 space-y-12 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-center">Blog</h1>
      <BlogListClient posts={posts} />
    </main>
  );
}

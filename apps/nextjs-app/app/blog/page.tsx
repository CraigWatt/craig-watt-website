// app/blog/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SiteBreadcrumbs } from '../components/SiteBreadcrumbs';
import { BlogCard } from '../components/BlogCard';
import posts from '../config/posts';

export default function BlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Read category from query param; default to 'All'
  const categoryParam = searchParams.get('category') || 'All';

  // 2. Derive unique categories from posts (filter out falsy)
  const categoriesSet = new Set<string>();
  for (const p of posts) {
    if (p.category) {
      categoriesSet.add(p.category);
    }
  }
  const categories = Array.from(categoriesSet);
  categories.sort((a, b) => a.localeCompare(b));
  const allOptions = ['All', ...categories];

  // 3. Validate selectedCategory
  const selectedCategory = allOptions.includes(categoryParam)
    ? categoryParam
    : 'All';

  // 4. Filter posts array
  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  // 5. Handler: when user picks a new category, navigate accordingly
  const onCategoryChange = (newCat: string) => {
    if (newCat === 'All') {
      router.push('/blog');
    } else {
      router.push(`/blog?category=${encodeURIComponent(newCat)}`);
    }
  };

  // 6. Build breadcrumbs:
  //    - Always: Home > Blog
  //    - If filtering (selectedCategory !== 'All'), show “Blog” as link and category as current
  const crumbs: Array<{ label: string; href?: string; current?: boolean }> = [
    { label: 'Home', href: '/' },
    selectedCategory === 'All'
      ? { label: 'Blog', current: true }
      : { label: 'Blog', href: '/blog' },
  ];
  if (selectedCategory !== 'All') {
    crumbs.push({ label: selectedCategory, current: true });
  }

  return (
    <main className="py-16 px-4 md:px-6 space-y-12 max-w-5xl mx-auto">
      {/* Breadcrumbs: left-aligned within content column */}
      <SiteBreadcrumbs items={crumbs} />

      {/* Page Title */}
      <h1 className="text-4xl font-bold text-center">Blog</h1>

      {/* Filter UI */}
      <div className="flex justify-center mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="
            border border-default/40 dark:border-default/60
            bg-white dark:bg-zinc-800
            text-zinc-900 dark:text-white
            px-3 py-1 rounded
          "
        >
          {allOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <BlogCard
            key={post.slug}
            title={post.title}
            href={`/blog/${post.slug}`}
            excerpt={post.excerpt}
            image={post.thumb}
            date={post.date}
            readingTime={post.readingTime}
            category={post.category}
          />
        ))}
        {filteredPosts.length === 0 && (
          <p className="col-span-full text-center text-zinc-500 dark:text-zinc-400">
            No posts found in “{selectedCategory}”
          </p>
        )}
      </div>
    </main>
  );
}

// app/blog/BlogList.client.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SiteBreadcrumbs } from '../components/SiteBreadcrumbs';
import { BlogCard } from '../components/BlogCard';
import type { Post } from '../config/posts';

type Props = { posts: Post[] };

export default function BlogListClient({ posts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') || 'All';

  // derive & sort category list
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c)))
  ).sort((a, b) => a.localeCompare(b));
  const allOptions = ['All', ...categories];

  // clamp to valid selection
  const selectedCategory = allOptions.includes(categoryParam)
    ? categoryParam
    : 'All';

  // filter posts
  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  // on-change handler
  const onCategoryChange = (newCat: string) => {
    const base = '/blog';
    router.push(
      newCat === 'All' ? base : `${base}?category=${encodeURIComponent(newCat)}`
    );
  };

  // breadcrumbs
  const crumbs = [
    { label: 'Home', href: '/' },
    selectedCategory === 'All'
      ? { label: 'Blog', current: true }
      : { label: 'Blog', href: '/blog' },
    ...(selectedCategory === 'All'
      ? []
      : [{ label: selectedCategory, current: true }]),
  ];

  return (
    <>
      <SiteBreadcrumbs items={crumbs} />

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
    </>
  );
}

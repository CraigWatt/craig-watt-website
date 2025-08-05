'use client';
import React, { Suspense, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SiteBreadcrumbs } from '../components/SiteBreadcrumbs';
import { BlogCard } from '../components/BlogCard';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react';
import { ChevronDown } from 'lucide-react';

import { allPosts } from 'content-collections';

// Type 'Post' is correctly inferred from allPosts.
// We can use a type guard to filter out posts with a missing thumb.
const posts = allPosts?.filter((p) => p.thumb) ?? [];

export const dynamic = 'force-dynamic';

export default function BlogPage() {
  return (
    <div className="bg-default/5 dark:bg-default/20">
      <main className="min-h-screen py-16 px-4 md:px-6 space-y-12 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center">Blog</h1>

        <Suspense fallback={<div>Loading posts…</div>}>
          <BlogList posts={posts} />
        </Suspense>
      </main>
    </div>
  );
}

function BlogList({ posts }: { posts: typeof allPosts }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') || 'All';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const POSTS_PER_PAGE = 6;

  // This console.log is no longer needed since the problem is resolved.
  // useEffect(() => {
  //   console.log(posts.map((p) => typeof p.thumb));
  // }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageParam]);

  type CategoryItem = { key: string; label: string; textValue: string };

  const categories = useMemo(() => {
    return Array.from(
      new Set(posts.map((p) => p.category).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const allOptions: CategoryItem[] = useMemo(() => [
    { key: 'All', label: 'All', textValue: 'All' },
    ...categories.map((cat) => ({
      key: cat,
      label: cat,
      textValue: cat,
    })),
  ], [categories]);

  // Find the selected option object
  const selectedOption = allOptions.find(opt => opt.key === categoryParam) ?? allOptions[0];
  const selectedCategory = selectedOption.key;

  // navigate
  const onCategoryChange = useCallback((newCat: string) => {
    const params = new URLSearchParams(searchParams);
    if (newCat === 'All') {
      params.delete('category');
    } else {
      params.set('category', newCat);
    }
    router.push(`/blog?${params.toString()}`);
  }, [searchParams, router]);

  // filter
  const filteredPosts = useMemo(() => {
    const relevantPosts = selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

    return relevantPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts, selectedCategory]);

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

  const changePage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`/blog?${params.toString()}`);
  }, [searchParams, router]);

  const paginatedPosts = useMemo(() => {
    const start = (pageParam - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, pageParam]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  return (
  <>
    <SiteBreadcrumbs items={crumbs} />

    <div className="flex justify-center mb-6">
      {/* FIX: Remove the render prop and pass children directly */}
      <Dropdown>
        <DropdownTrigger>
          <Button>
            {selectedOption.label} <ChevronDown size={14} />
          </Button>
        </DropdownTrigger>

        <DropdownMenu<CategoryItem>
          aria-label="Select category"
          items={allOptions}
          onAction={(key) => onCategoryChange(key as string)}
          selectedKeys={[selectedOption.textValue]}
        >
          {(item) => (
            <DropdownItem
              key={item.key}
              textValue={item.textValue}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedPosts.map((post) => (
        <BlogCard
          key={post.slug ?? 'missing-slug'}
          title={post.title ?? 'Untitled'}
          href={`/blog/${post.slug ?? ''}`}
          excerpt={post.excerpt ?? post.summary ?? ''}
          imageSrc={post.thumb}
          date={post.date ?? '1970-01-01'}
          readingTime={post.readingTime ?? ''}
          category={post.category ?? 'Uncategorized'}
          badges={post.badges ?? []}
        />
      ))}
      {filteredPosts.length === 0 && (
        <p className="col-span-full text-center text-zinc-500 dark:text-zinc-400">
          No posts found in “{selectedOption.label}”
        </p>
      )}
    </div>
    {totalPages > 1 && (
      <div className="w-full flex justify-center mt-10">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            onClick={() => changePage(pageParam - 1)}
            isDisabled={pageParam <= 1}
          >
            ← Previous
          </Button>

          <span className="text-sm text-default-500">
            Page {pageParam} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="flat"
            onClick={() => changePage(pageParam + 1)}
            isDisabled={pageParam >= totalPages}
          >
            Next →
          </Button>
        </div>
      </div>
    )}
  </>
);
}

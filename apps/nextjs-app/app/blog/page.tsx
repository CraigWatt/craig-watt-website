// app/blog/page.tsx
'use client'
import React, { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SiteBreadcrumbs } from '../components/SiteBreadcrumbs'
import { BlogCard } from '../components/BlogCard'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import posts from '../config/posts'
import type { Post } from '../config/posts'

export const dynamic = 'force-dynamic'

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
  )
}

function BlogList({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category') || 'All'

  // derive categories
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c)))
  ).sort((a, b) => a.localeCompare(b))
  const allOptions = ['All', ...categories]
  const selectedCategory = allOptions.includes(categoryParam)
    ? categoryParam
    : 'All'

  // navigate
  const onCategoryChange = (newCat: string) => {
    const base = '/blog'
    router.push(
      newCat === 'All'
        ? base
        : `${base}?category=${encodeURIComponent(newCat)}`
    )
  }

  // filter
  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory)

  // breadcrumbs
  const crumbs = [
    { label: 'Home', href: '/' },
    selectedCategory === 'All'
      ? { label: 'Blog', current: true }
      : { label: 'Blog', href: '/blog' },
    ...(selectedCategory === 'All'
      ? []
      : [{ label: selectedCategory, current: true }]),
  ]

  return (
    <>
      <SiteBreadcrumbs items={crumbs} />

      <div className="flex justify-center mb-6">
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="flat" className="flex items-center gap-1">
              {selectedCategory} <ChevronDown size={14} />
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Select category">
            <>
              <DropdownItem
                key="All"
                onClick={() => onCategoryChange('All')}
              >
                All
              </DropdownItem>
              {categories.map((cat) => (
                <DropdownItem
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                >
                  {cat}
                </DropdownItem>
              ))}
            </>
          </DropdownMenu>
        </Dropdown>
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
  )
}

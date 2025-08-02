// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Snippet } from '@heroui/react'
import { SiteBreadcrumbs } from '../../components/SiteBreadcrumbs'
import posts from '../../config/posts'

// generateStaticParams stays the same
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

interface Props {
  // now promises
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PostDetail({
  params,
  searchParams,
}: Props) {
  // unwrap them
  const { slug } = await params
  // if you actually need searchParams, e.g.
  // const sp = await searchParams

  const post = posts.find((p) => p.slug === slug)
  if (!post) {
    return notFound()
  }

  const renderContent = () => {
    switch (slug) {
      case 'intro-to-observability':
        return <p>Observability is critical for maintaining reliable systems…</p>
      case 'k3s-on-raspberry-pi':
        return <p>In this guide, we’ll spin up k3s on Raspberry Pi devices…</p>
      default:
        return <p>Content not found.</p>
    }
  }

  return (
    <main className="py-16 px-4 md:px-6 max-w-3xl mx-auto space-y-12">
      <SiteBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title, current: true },
        ]}
      />

      <Link href="/blog">
        <Button as="span" variant="ghost" size="sm">
          ← All Posts
        </Button>
      </Link>

      <h1 className="text-4xl font-bold">{post.title}</h1>

      {post.hero && (
        <div className="mx-auto w-full max-w-3xl">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={post.hero}
              alt={`${post.title} banner`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      )}

      <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </time>
        {post.readingTime && ` · ${post.readingTime}`}
      </p>

      <article className="prose dark:prose-invert max-w-none">
        {renderContent()}
      </article>

      {(() => {
        const snippets = post.codeSnippets ?? []
        if (snippets.length === 0) return null
        return (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Code Snippets</h2>
            {snippets.map((code, i) => (
              <Snippet key={i} className="rounded-lg">
                {code}
              </Snippet>
            ))}
          </section>
        )
      })()}
    </main>
  )
}

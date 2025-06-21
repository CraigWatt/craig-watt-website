// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { SiteBreadcrumbs } from '../../components/SiteBreadcrumbs';
import posts from '../../config/posts';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostDetail({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return notFound();

  const renderContent = () => {
    switch (slug) {
      case 'intro-to-observability':
        return (
          <>
            <p>Observability is critical for maintaining reliable systems...</p>
            {/* ... */}
          </>
        );
      case 'k3s-on-raspberry-pi':
        return (
          <>
            <p>In this guide, we’ll spin up k3s on Raspberry Pi devices...</p>
            {/* ... */}
          </>
        );
      default:
        return <p>Content not found.</p>;
    }
  };

  return (
    <main className="py-16 px-4 md:px-6 max-w-3xl mx-auto space-y-12">
      {/* Breadcrumbs via SiteBreadcrumbs */}
      <SiteBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title, current: true },
        ]}
      />

      {/* Back */}
      <Link href="/blog">
        <Button as="span" variant="ghost" size="sm">
          ← All Posts
        </Button>
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-bold">{post.title}</h1>

      {/* Hero */}
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

      {/* Meta */}
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

      {/* Content */}
      <article className="prose dark:prose-invert max-w-none">
        {renderContent()}
      </article>
    </main>
  );
}

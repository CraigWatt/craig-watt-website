import { notFound } from 'next/navigation';
import Image from 'next/image';
import posts from '../../config/posts';
import { Breadcrumbs, BreadcrumbItem, Button } from '@heroui/react';
import Link from 'next/link';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function PostDetail({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = posts.find((p) => p.slug === slug);
  if (!post) return notFound();

  // e.g. screens/images in body are in MDX or imported separately
  return (
    <main className="py-16 px-4 md:px-6 max-w-3xl mx-auto space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-4" aria-label="Breadcrumbs">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/blog">Blog</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{post.title}</BreadcrumbItem>
      </Breadcrumbs>

      <Link href="/blog">
        <Button as="span" variant="ghost" size="sm">
          ← All Posts
        </Button>
      </Link>

      <h1 className="text-4xl font-bold">{post.title}</h1>

      {post.hero && (
        <div className="mx-auto w-full max-w-3xl">
          <div className="relative w-full aspect-[3/1] overflow-hidden rounded-lg">
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
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>
        {post.readingTime && ` · ${post.readingTime}`}
      </p>

      {/* The main content: you can render MDX here or static HTML */}
      <article className="prose dark:prose-invert">
        {/* ... your markdown content ... */}
      </article>
    </main>
  );
}

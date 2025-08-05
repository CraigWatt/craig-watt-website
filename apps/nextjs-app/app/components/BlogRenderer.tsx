'use client';

import { ComponentProps, ReactNode } from 'react';
import { Link } from '@heroui/link';
import NextImage from 'next/image';
import { SiteBreadcrumbs } from './SiteBreadcrumbs';
import { Button, Snippet, Card } from '@heroui/react';

// 1) Shape of the post metadata you consume:
interface PostMeta {
  title: string;
  hero?: string;
  heroWidth?: number;
  heroHeight?: number;
  date: string;
  readingTime?: string;
  author?: string;
  badges?: string[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// MDX needs a catch-all, because it will pass arbitrary props (className, style, etc).
type MDXComponents = Record<string, React.ComponentType<any>>
type MDXBodyType  = React.ComponentType<{ components: MDXComponents }>
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface BlogRendererProps {
  post: PostMeta;
  MDXBody: MDXBodyType;
}

export function BlogRenderer({ post, MDXBody }: BlogRendererProps) {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title, current: true },
  ];

  return (
    <main className="py-16 px-4 md:px-6 max-w-3xl mx-auto space-y-12">
      <SiteBreadcrumbs items={crumbs} />

      <div className="mb-6">
        <Link href="/blog">
          <Button as="span" variant="flat" size="sm">
            ← All Posts
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold">{post.title}</h1>
      {post.hero && post.heroWidth && post.heroHeight && (
        <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden rounded-lg">
          <NextImage
            src={post.hero}
            alt={`${post.title} banner`}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="flex items-center justify-between space-x-4 mt-4">
        <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </time>
          {post.readingTime && ` · ${post.readingTime}`}
          {post.author && post.author !== 'Craig Watt' && ` · by ${post.author}`}
        </p>

        {post.badges?.length ? (
          <Card shadow="sm" radius="md" fullWidth={false}>
            <div className="flex flex-row flex-wrap items-center space-x-2 p-2">
              {post.badges.map((badge) => (
                <NextImage
                  key={badge}
                  src={`/icons/${badge}.svg`}
                  alt={`${badge} logo`}
                  width={24}
                  height={24}
                />
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <article className="prose dark:prose-invert max-w-none">
        <MDXBody
          components={{
            h1: (props: ComponentProps<'h1'>) => (
              <h1 className="text-3xl font-bold mt-12 text-default-800" {...props} />
            ),
            h2: (props: ComponentProps<'h2'>) => (
              <h2 className="text-2xl font-semibold mt-8 text-default-800" {...props} />
            ),
            p: (props: ComponentProps<'p'>) => (
              <p className="text-lg leading-relaxed mt-4 text-default-700" {...props} />
            ),
            ul: (props: ComponentProps<'ul'>) => (
              <ul
                className="list-disc list-outside pl-5 space-y-2 mt-4 text-default-700"
                {...props}
              />
            ),
            li: (props: ComponentProps<'li'>) => (
              <li className="text-lg leading-relaxed" {...props} />
            ),

            // turn MDX <a> into HeroUI Link
            a: ({ href = '#', children }: { href?: string; children: ReactNode }) => (
              <Link href={href} className="underline">
                {children}
              </Link>
            ),

            // turn MDX <Image> into NextImage
            Image: (props: ComponentProps<typeof NextImage>) => {
              const src =
                typeof props.src === 'string' && !props.src.startsWith('/')
                  ? `/${props.src}`
                  : props.src;
              return (
                <div className="mx-auto w-full max-w-3xl my-6">
                  <NextImage
                    {...props}
                    src={src}
                    alt={props.alt || 'Blog image'}
                    width={props.width}
                    height={props.height}
                    className="rounded-lg"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              );
            },

            Snippet,
          }}
        />

        <div className="mt-6">
          <Link href="/blog">
            <Button as="span" variant="flat" size="md">
              ← All Posts
            </Button>
          </Link>
        </div>
      </article>
    </main>
  );
}

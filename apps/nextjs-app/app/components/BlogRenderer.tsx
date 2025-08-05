'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SiteBreadcrumbs } from './SiteBreadcrumbs';
import { Button, Snippet, Card } from '@heroui/react';

export function BlogRenderer({
  post,
  MDXBody,
}: {
  post: any;
  MDXBody: any;
}) {
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

        {post.badges?.length > 0 && (
          <Card shadow="sm" radius="md" fullWidth={false}>
            <div className="flex flex-row flex-wrap items-center space-x-2 p-2">
              {post.badges.map((badge: string) => (
                <Image
                  key={badge}
                  src={`/icons/${badge}.svg`}
                  alt={`${badge} logo`}
                  className="h-6 w-6"
                />
              ))}
            </div>
          </Card>
        )}
      </div>
      <article className="prose dark:prose-invert max-w-none">
        <MDXBody
          components={{
            h1: (props: any) => (
              <h1 className="text-3xl font-bold mt-12 text-default-800" {...props} />
            ),
            h2: (props: any) => (
              <h2 className="text-2xl font-semibold mt-8 text-default-800" {...props} />
            ),
            p: (props: any) => (
              <p className="text-lg leading-relaxed mt-4 text-default-700" {...props} />
            ),
            ul: (props: any) => (
              <ul
                className="list-disc list-outside pl-5 space-y-2 mt-4 text-default-700"
                {...props}
              />
            ),
            li: (props: any) => (
              <li className="text-lg leading-relaxed" {...props} />
            ),
            a: (props: React.ComponentProps<'a'>) => {
              const { href = '#', ...rest } = props;
              return <Link href={href} {...rest} className="underline" />;
            },
            Image: (props: any) => {
              const src =
                typeof props.src === 'string' && !props.src.startsWith('/')
                  ? `/${props.src}`
                  : props.src;
              return (
                <div className="mx-auto w-full max-w-3xl my-6">
                  <Image
                    {...props}
                    src={src}
                    alt={props.alt || 'Blog image'}
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

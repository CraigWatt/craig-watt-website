'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge } from '@heroui/react';

export type BlogCardProps = {
  title: string;
  href: string;
  excerpt: string;
  image: string;
  date: string; // ISO date
  readingTime?: string;
  category?: string;
};

export function BlogCard({
  title,
  href,
  excerpt,
  image,
  date,
  readingTime,
  category,
}: BlogCardProps) {
  // Format date, e.g. "Jun 20, 2025"
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col rounded-lg border border-default/40 dark:border-default/60 overflow-hidden bg-transparent transition hover:bg-default/10 dark:hover:bg-default/30 hover:shadow-lg motion-safe:transform-gpu">
      {/* Thumbnail */}
      <Link href={href} className="block relative w-full aspect-[4/3]">
        <Image
          src={image}
          alt={`Thumbnail for ${title}`}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Meta row: category, date, reading time */}
        <div className="flex flex-wrap items-center text-sm text-zinc-500 dark:text-zinc-400 mb-2 gap-2">
          {category && (
            // Use a Badge if HeroUI provides one with a valid variant
            <Badge variant="faded" size="sm">
              {category}
            </Badge>
          )}
          <time dateTime={date}>{formattedDate}</time>
          {readingTime && <span>· {readingTime}</span>}
        </div>

        {/* Title */}
        <Link href={href} className="hover:underline">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm mb-4 line-clamp-3">{excerpt}</p>

        {/* Footer: Read more button */}
        <div className="mt-auto">
          <Link href={href}>
            <Button as="span" variant="ghost" size="sm">
              Read more →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

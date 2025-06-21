// components/BlogCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export type BlogCardProps = {
  title: string;
  href: string;
  excerpt: string;
  image: string; // e.g. "/images/blog/intro-to-observability/intro-to-observability-thumb.webp"
  date?: string; // ISO date string, e.g. '2025-06-01'
  readingTime?: string;
  category?: string;
  tags?: string[];
};

function getOrdinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function BlogCard({
  title,
  href,
  excerpt,
  image,
  date,
  readingTime,
  category,
  tags,
}: BlogCardProps) {
  // Format date with ordinal suffix if provided
  let formattedDate: string | undefined;
  if (date) {
    const dt = new Date(date);
    if (!isNaN(dt.getTime())) {
      const day = dt.getDate();
      const suffix = getOrdinalSuffix(day);
      // month name
      const month = dt.toLocaleDateString('en-GB', { month: 'long' }); // e.g. "June"
      const year = dt.getFullYear();
      formattedDate = `${day}${suffix} ${month} ${year}`; // e.g. "1st June 2025"
    }
  }

  return (
    <Link
      href={href}
      className="
        block rounded-lg border border-default/40 dark:border-default/60
        bg-transparent transition hover:bg-default/10 dark:hover:bg-default/30
        hover:shadow-lg hover:-translate-y-1 motion-safe:transform-gpu cursor-pointer overflow-hidden
      "
    >
      <div className="relative w-full aspect-[16/9] bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={image}
          alt={`${title} thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-4 space-y-2">
        {(category || formattedDate) && (
          <div className="flex flex-wrap items-center text-xs text-zinc-500 dark:text-zinc-400 space-x-1">
            {category && <span>{category}</span>}
            {category && formattedDate && <span>·</span>}
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        )}
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{excerpt}</p>
        {readingTime && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {readingTime}
          </p>
        )}
      </div>
    </Link>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';

export type BlogCardProps = {
  title: string;
  href: string;
  excerpt?: string;
  image?: string;
  date?: string; // ISO date string, e.g. '2025-06-01'
  readingTime?: string;
  category?: string;
  tags?: string[];
  badges: string[];
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
  badges,
}: BlogCardProps) {
  // Simplify date formatting by using a single expression
  const formattedDate = date ? (() => {
    const dt = new Date(date);
    if (isNaN(dt.getTime())) return undefined;

    const day = dt.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = dt.toLocaleDateString('en-GB', { month: 'long' });
    const year = dt.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  })() : undefined;

  const finalImageSrc = image ?? '/images/default-thumb.jpg';

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
          src={finalImageSrc}
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
        {badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((badge: string) => (
              <Image
                key={badge}
                src={`/icons/${badge}.svg`}
                alt={`${badge} logo`}
                className="h-5 w-5"
              />
            ))}
          </div>
        )}
        {readingTime && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {readingTime}
          </p>
        )}
      </div>
    </Link>
  );
}

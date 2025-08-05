'use client';

import NextImage from 'next/image';
import { Link } from '@heroui/link';

export type BlogCardProps = {
  title: string;
  href: string;
  excerpt?: string;
  imageSrc?: string;
  imageWidth?: number;    // allow specifying explicit dimensions
  imageHeight?: number;
  date?: string; // ISO date string, e.g. '2025-06-01'
  readingTime?: string;
  category?: string;
  badges?: string[];
};

function getOrdinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function BlogCard({
  title,
  href,
  excerpt,
  imageSrc = '/images/default-thumb.jpg',
  imageWidth,
  imageHeight,
  date,
  readingTime,
  category,
  badges = [],
}: BlogCardProps) {
  const formattedDate = date
    ? (() => {
        const dt = new Date(date);
        if (isNaN(dt.getTime())) return undefined;
        const day = dt.getDate();
        const suffix = getOrdinalSuffix(day);
        const month = dt.toLocaleDateString('en-GB', { month: 'long' });
        const year = dt.getFullYear();
        return `${day}${suffix} ${month} ${year}`;
      })()
    : undefined;

  return (
    <Link
      href={href}
      className="
        block rounded-lg border border-default/40 dark:border-default/60
        bg-transparent transition hover:bg-default/10 dark:hover:bg-default/30
        hover:shadow-lg hover:-translate-y-1 motion-safe:transform-gpu cursor-pointer overflow-hidden
      "
    >
      <div className="relative w-full aspect-[16/9] bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-t-lg">
        <NextImage
          src={imageSrc}
          alt={`${title} thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
          {...(imageWidth && imageHeight ? { width: imageWidth, height: imageHeight } : {})}
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
        <h3 className="text-xl font-semibold text-default-900">{title}</h3>
        <p className="text-sm text-default-700">{excerpt}</p>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {badges.map((badge) => (
              <div key={badge} className="rounded-full overflow-hidden">
                <NextImage
                  src={`/icons/${badge}.svg`}
                  alt={`${badge} logo`}
                  width={20}
                  height={20}
                />
              </div>
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

'use client';

import NextImage from 'next/image';
import { Link } from '@heroui/link';
import { ArrowUpRight } from 'lucide-react';

export type BlogCardProps = {
  title: string;
  href: string;
  excerpt?: string;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  date?: string;
  readingTime?: string;
  category?: string;
  badges?: string[];
};

function formatDate(dateString: string): string {
  const dt = new Date(dateString);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-GB', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function BlogCard({
  title,
  href,
  excerpt,
  imageSrc = '/images/default-thumb.jpg',
  date,
  readingTime,
  category,
}: BlogCardProps) {
  const formattedDate = date ? formatDate(date) : undefined;

  return (
    <Link
      href={href}
      className="
        group block rounded-xl overflow-hidden
        bg-[var(--color-background)]
        border border-[var(--color-border)]
        card-hover
        cursor-pointer
      "
    >
      {/* Image container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[var(--color-border)]">
        <NextImage
          src={imageSrc}
          alt={`${title} thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge */}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider bg-[var(--color-background)]/90 text-[var(--color-foreground)] rounded-full backdrop-blur-sm">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Meta info */}
        {(formattedDate || readingTime) && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && readingTime && <span className="w-1 h-1 rounded-full bg-[var(--color-muted)]" />}
            {readingTime && <span>{readingTime}</span>}
          </div>
        )}
        
        {/* Title */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
            {title}
          </h3>
          <ArrowUpRight 
            className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" 
          />
        </div>
        
        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed line-clamp-2">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

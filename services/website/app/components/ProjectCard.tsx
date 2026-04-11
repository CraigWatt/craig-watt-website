'use client';

import NextImage from 'next/image';
import { Link } from '@heroui/link';
import { ArrowUpRight } from 'lucide-react';

export type ProjectCardProps = {
  title: string;
  href: string;
  description: string;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  badges?: string[];
};

export function ProjectCard({
  title,
  href,
  description,
  imageSrc,
  imageWidth,
  imageHeight,
  badges = [],
}: ProjectCardProps) {
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
          width={imageWidth}
          height={imageHeight}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors">
            {title}
          </h3>
          <ArrowUpRight 
            className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" 
          />
        </div>
        
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed line-clamp-2">
          {description}
        </p>

        {badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {badges.slice(0, 4).map((b) => (
              <div 
                key={b}
                className="flex items-center justify-center w-6 h-6 rounded-md bg-[var(--color-card)] p-1"
              >
                <NextImage
                  src={`/icons/${b}.svg`}
                  alt={`${b} logo`}
                  width={16}
                  height={16}
                  className="w-4 h-4 opacity-70"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

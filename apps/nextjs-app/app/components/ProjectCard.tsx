'use client';

import Image from 'next/image';
import Link from 'next/link';

export type ProjectCardProps = {
  title: string;
  href: string;
  description: string;
  image: string;        // thumbnail path, ideally 16:9
  badges?: string[];    // new optional tech‐stack badges
};

export function ProjectCard({
  title,
  href,
  description,
  image,
  badges = [],
}: ProjectCardProps) {
  return (
    <Link
      href={href}
      className="
        block rounded-lg border border-default/40 dark:border-default/60
        bg-transparent transition hover:bg-default/10 dark:hover:bg-default/30
        hover:shadow-lg hover:-translate-y-1 motion-safe:transform-gpu cursor-pointer overflow-hidden
      "
    >
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={image}
          alt={`${title} thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-2xl font-medium">{title}</h3>
        <p className="text-sm text-default-700">{description}</p>

        {/* Tech-stack badges (first 3 only) */}
        {badges.length > 0 && (
          <div className="flex flex-wrap items-center space-x-2">
            {badges.slice(0, 3).map((b) => (
              <img
                key={b}
                src={`/icons/${b}.svg`}
                alt={`${b} logo`}
                className="h-5 w-5"
              />
            ))}
          </div>
        )}

        <span className="inline-block text-sm font-semibold underline">
          Learn more →
        </span>
      </div>
    </Link>
  );
}

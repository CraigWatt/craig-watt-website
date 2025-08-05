'use client';

import NextImage from 'next/image';
import { Link } from '@heroui/link';

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
        block rounded-lg border border-default/40 dark:border-default/60
        bg-transparent transition hover:bg-default/10 dark:hover:bg-default/30
        hover:shadow-lg hover:-translate-y-1 motion-safe:transform-gpu cursor-pointer overflow-hidden text-inherit
      "
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
        <NextImage
          src={imageSrc}
          alt={`${title} thumbnail`}
          width={imageWidth}
          height={imageHeight}
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-2xl font-medium text-default-900">{title}</h3>
        <p className="text-sm text-default-700">{description}</p>

        {badges.length > 0 && (
          <div className="flex flex-wrap items-center space-x-2">
            {badges.slice(0, 3).map((b) => (
              <NextImage
                key={b}
                src={`/icons/${b}.svg`}
                alt={`${b} logo`}
                width={20}
                height={20}
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

'use client';

import Image from 'next/image';
import Link from 'next/link';

export type ProjectCardProps = {
  title: string;
  href: string;
  description: string;
  image: string; // thumbnail path, ideally 16:9
};

export function ProjectCard({
  title,
  href,
  description,
  image,
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
      <div className="p-4">
        <h3 className="text-2xl font-medium mb-2">{title}</h3>
        <p className="text-sm mb-4">{description}</p>
        <span className="inline-block text-sm font-semibold underline">
          Learn more →
        </span>
      </div>
    </Link>
  );
}

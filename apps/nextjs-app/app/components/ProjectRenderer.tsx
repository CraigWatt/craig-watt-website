'use client';

import { ComponentProps, ReactNode } from 'react';
import { Link } from '@heroui/link';
import NextImage from 'next/image';
import { Snippet, Button, Card } from '@heroui/react';
import { SiteBreadcrumbs } from './SiteBreadcrumbs';
import { type Project } from 'content-collections';

/* eslint-disable @typescript-eslint/no-explicit-any */
// MDXBody needs to accept arbitrary props (className, style, data-*, etc.)
export type MDXComponents = Record<string, React.ComponentType<any>>
export type MDXBodyType  = React.ComponentType<{ components: MDXComponents }>
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Props for our renderer */
export interface ProjectRendererProps {
  project: Project;
  MDXBody: MDXBodyType;
}

export function ProjectRenderer({
  project,
  MDXBody,
}: ProjectRendererProps) {
  const crumbs = [
    { label: 'Home',    href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: project.title, current: true },
  ];

  return (
    <main className="py-16 px-4 md:px-6 max-w-3xl mx-auto space-y-12">
      <SiteBreadcrumbs items={crumbs} />

      <article className="space-y-8">
        <div className="mb-6">
          <Link href="/projects">
            <Button as="span" variant="flat" size="sm">
              ← All Projects
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold">{project.title}</h1>

        {/* hero image */}
        {project.hero && project.heroWidth && project.heroHeight && (
          <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden rounded-lg">
            <NextImage
              src={project.hero}
              alt={`${project.title} banner`}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* tech-stack + GitHub */}
        <div className="flex items-start justify-between space-x-4 mt-4">
          {project.badges?.length ? (
            <Card shadow="sm" radius="md" fullWidth={false}>
              <div className="flex flex-wrap items-center space-x-2 p-2">
                {project.badges.map((badge) => (
                  <NextImage
                    key={badge}
                    src={`/icons/${badge}.svg`}
                    alt={`${badge} logo`}
                    width={24}
                    height={24}
                  />
                ))}
              </div>
            </Card>
          ) : null}
          {project.github && (
            <Button as="a" href={project.github} variant="ghost" size="md">
              View on GitHub
            </Button>
          )}
        </div>

        <p className="text-lg font-medium">{project.summary}</p>

        {/* MDX content */}
        <div className="prose dark:prose-invert max-w-none">
          <MDXBody
            components={{
              h1: (props: ComponentProps<'h1'>) => (
                <h1 className="text-3xl font-bold mt-12" {...props} />
              ),
              h2: (props: ComponentProps<'h2'>) => (
                <h2 className="text-2xl font-semibold mt-8" {...props} />
              ),
              p: (props: ComponentProps<'p'>) => (
                <p className="text-lg leading-relaxed mt-4" {...props} />
              ),
              ul: (props: ComponentProps<'ul'>) => (
                <ul className="list-disc pl-5 mt-4" {...props} />
              ),
              li: (props: ComponentProps<'li'>) => (
                <li className="text-lg leading-relaxed" {...props} />
              ),
              a: ({ href = '#', children }: { href?: string; children: ReactNode }) => (
                <Link href={href} className="underline">
                  {children}
                </Link>
              ),

              Snippet,

              Image: (props: ComponentProps<typeof NextImage>) => {
                const src =
                  typeof props.src === 'string' && !props.src.startsWith('/')
                    ? `/${props.src}`
                    : props.src;
                return (
                  <div className="mx-auto w-full max-w-3xl my-6 relative aspect-[16/9] overflow-hidden rounded-lg">
                    <NextImage
                      {...props}
                      src={src}
                      alt={props.alt || 'Image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                );
              },

              ProjectImage: (props: ComponentProps<typeof NextImage> & { src: string; alt?: string }) => {
                const { width, height, src: rawSrc, alt, ...rest } = props;
                const src = rawSrc.startsWith('/') ? rawSrc : `/${rawSrc}`;

                if (width && height) {
                  return (
                    <div className="mx-auto w-full max-w-3xl my-6 overflow-hidden rounded-lg">
                      <NextImage
                        src={src}
                        alt={alt || 'Project image'}
                        width={width}
                        height={height}
                        className="object-cover"
                        {...rest}
                      />
                    </div>
                  );
                }

                return (
                  <div className="mx-auto w-full max-w-3xl my-6 relative aspect-[16/9] overflow-hidden rounded-lg">
                    <NextImage
                      src={src}
                      alt={alt || 'Project image'}
                      fill
                      className="object-cover"
                      {...rest}
                    />
                  </div>
                );
              },
            }}
          />
        </div>

        {/* bottom links */}
        <div className="flex justify-between items-center mt-8">
          <Link href="/projects">
            <Button as="span" variant="flat" size="md">
              ← All Projects
            </Button>
          </Link>
          {project.github && (
            <Button as="a" href={project.github} variant="ghost" size="md">
              View on GitHub
            </Button>
          )}
        </div>
      </article>
    </main>
  );
}

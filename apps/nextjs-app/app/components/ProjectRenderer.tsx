'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Snippet, Button, Card } from '@heroui/react';
import { SiteBreadcrumbs } from './SiteBreadcrumbs';

export function ProjectRenderer({
  project,
  MDXBody,
}: {
  project: any;
  MDXBody: any;
}) {
  const crumbs = [
    { label: 'Home', href: '/' },
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

        {/* ← Here’s your hero image, reinstated */}
        <Image
          src={project.hero}
          alt={`${project.title} banner`}
          width={project.heroWidth}
          height={project.heroHeight}
          className="rounded-lg mx-auto"
          style={{ objectFit: 'cover' }}
        />

        {/* tech-stack card + top GitHub button */}
        <div className="flex items-start justify-between space-x-4 mt-4">
          {project.badges?.length > 0 && (
            <Card shadow="sm" radius="md" fullWidth={false}>
              {/* force a row layout here */}
              <div className="flex flex-row flex-wrap items-center space-x-2 p-2">
                {project.badges.map((badge: string) => (
                  <Image
                    key={badge}
                    src={`/icons/${badge}.svg`}
                    alt={`${badge} logo`}
                    className="h-6 w-6"
                  />
                ))}
              </div>
            </Card>
          )}

          {project.github && (
            <Button as="a" href={project.github} variant="ghost" size="md">
              View on GitHub
            </Button>
          )}
        </div>

        <p className="text-lg font-medium">{project.summary}</p>

        {/* MDX content starts here */}
        <div className="prose dark:prose-invert max-w-none">
          <MDXBody
            components={{
              h1: (props: any) => (
                <h1 className="text-3xl font-bold text-default-800 mt-12" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="text-2xl font-semibold text-default-800 mt-8" {...props} />
              ),
              p: (props: any) => (
                <p className="text-lg text-default-700 leading-relaxed mt-4" {...props} />
              ),
              ul: (props: any) => (
                <ul
                  className="list-disc list-outside pl-5 space-y-2 text-default-700 mt-4"
                  {...props}
                />
              ),
              li: (props: any) => (
                <li className="text-lg leading-relaxed" {...props} />
              ),
              a: (props: React.ComponentProps<'a'>) => {
                const { href = '#', ...rest } = props;
                return <Link href={href} {...rest} className="underline" />;
              },
              Image: (props: any) => {
                const src =
                  typeof props.src === 'string' && !props.src.startsWith('/')
                    ? `/${props.src}`
                    : props.src;
                return (
                  <div className="mx-auto w-full max-w-3xl my-6">
                    <Image
                      {...props}
                      src={src}
                      alt={props.alt || 'Project image'}
                      className="rounded-lg"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                );
              },
              Snippet,
              ProjectImage: (props: React.ComponentProps<typeof Image>) => {
                const { alt, src, ...rest } = props;
                const fixedSrc =
                  typeof src === 'string' && !src.startsWith('/') ? `/${src}` : src;
                return (
                  <div className="mx-auto w-full max-w-3xl my-6">
                    <Image
                      src={fixedSrc}
                      alt={alt || 'Project image'}
                      {...rest}
                      className="rounded-lg"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                );
              },
            }}
          />
        </div>
        {/* Bottom row: back + GitHub */}
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

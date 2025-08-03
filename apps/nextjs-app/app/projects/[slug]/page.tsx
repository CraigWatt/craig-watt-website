// app/projects/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Snippet } from '@heroui/react'
import ReactMarkdown from 'react-markdown'
import projects from '../../config/projects'
import { SiteBreadcrumbs } from '../../components/SiteBreadcrumbs'

// generate all the slugs for SSG
export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return notFound()

  const crumbs = [
    { label: 'Home',     href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: project.title, current: true },
  ]

  const snippets = project.codeSnippets ?? []
  const screens  = project.screens      ?? []

  return (
    <main className="py-16 px-4 md:px-6 max-w-3xl mx-auto space-y-12">
      <SiteBreadcrumbs items={crumbs} />

      <article className="space-y-8">
        <div className="mb-6">
          <Link href="/projects">
            <Button as="span" variant="ghost" size="sm">
              ← All Projects
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold">{project.title}</h1>

        {/* Hero image */}
        <div className="mx-auto w-full max-w-3xl">
          <div className="relative w-full aspect-[3/1] overflow-hidden rounded-lg">
            <Image
              src={project.hero}
              alt={`${project.title} banner`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Short summary */}
        <p className="text-lg font-medium">{project.summary}</p>

        {/* Full Markdown body */}
        {project.body && (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{project.body}</ReactMarkdown>
          </div>
        )}

        {/* Code snippets */}
        {snippets.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Code Snippets</h2>
            {snippets.map((code, i) => (
              <Snippet
                key={i}
                classNames={{
                  base:    'rounded-lg', 
                  pre:     'whitespace-pre-wrap break-words', 
                  content: 'overflow-auto',
                }}
              >
                {code}
              </Snippet>
      ))}
          </section>
        )}

        {/* Screenshots */}
        {screens.length > 0 && (
          <section className="space-y-8">
            {screens.map((img, i) => (
              <div key={i} className="mx-auto w-full max-w-3xl">
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={img.src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </section>
        )}
      </article>
    </main>
  )
}

// app/projects/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Snippet } from '@heroui/react'
import projects from '../../config/projects'
import { SiteBreadcrumbs } from '../../components/SiteBreadcrumbs'

// same as before
export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectDetail({
  params,
}: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return notFound()

  // always an array, even if undefined
  const snippets = project.codeSnippets ?? []
  const screens  = project.screens ?? []

  const crumbs = [
    { label: 'Home',     href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: project.title, current: true },
  ]

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

        {/* Description */}
        <p className="text-base leading-relaxed">{project.description}</p>

        {/* ← New Code Snippets Section */}
        {snippets.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Code Snippets</h2>
            {snippets.map((code, i) => (
            <Snippet
              key={i}
              classNames={{ base: 'rounded-lg' }}
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

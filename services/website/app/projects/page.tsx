// app/projects/page.tsx
'use client';
import { allProjects } from 'content-collections'
import { ProjectCard } from '../components/ProjectCard';

export default function ProjectsPage() {
  return (
    <main className="py-16 px-6 md:px-12 lg:px-24 space-y-12 max-w-6xl mx-auto">
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          Selected Engineering Work
        </p>
        <h1 className="text-4xl font-bold text-balance">Projects and platforms I&apos;ve built</h1>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">
          A small set of case studies and tools that show how I approach platforms, automation,
          observability, and the day-to-day realities of shipping reliable systems.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {allProjects.map((p) => (
          <ProjectCard
            key={p.slug}
            title={p.title}
            href={`/projects/${p.slug}`}
            description={p.summary}
            imageSrc={p.thumb ?? p.thumbLg!}
            imageWidth={p.thumbWidth  ?? p.thumbLgWidth!}
            imageHeight={p.thumbHeight ?? p.thumbLgHeight!}
            badges={p.badges}
          />
        ))}
      </div>
    </main>
  );
}

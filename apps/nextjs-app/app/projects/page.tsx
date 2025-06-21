// app/projects/page.tsx
import projects from '../config/projects';
import { ProjectCard } from '../components/ProjectCard';

export default function ProjectsPage() {
  return (
    <main className="py-16 px-4 md:px-6 space-y-12">
      <h1 className="text-4xl font-bold text-center">My Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {projects.map((p) => (
          <ProjectCard
            key={p.slug}
            title={p.title}
            href={`/projects/${p.slug}`}
            description={p.description}
            image={p.thumb}
          />
        ))}
      </div>
    </main>
  );
}

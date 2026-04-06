'use client';

import { useEffect, useState } from 'react';
import { ProjectRenderer, type MDXBodyType } from './ProjectRenderer';
import { allProjects, type Project } from 'content-collections';

export function ProjectClient({ slug }: { slug: string }) {
  // annotate here so Project is “used”
  const project: Project | undefined = allProjects.find((p) => p.slug === slug);

  const [MDXBody, setMDXBody] = useState<MDXBodyType | null>(null);

  useEffect(() => {
    if (!project) return;
    import(`../../content/projects/${project.filePath}`)
      .then((mod) => setMDXBody(() => mod.default as MDXBodyType))
      .catch(() => setMDXBody(null));
  }, [project]);

  if (!project)   return <div>Not Found</div>;
  if (!MDXBody)   return <div>Loading…</div>;

  return <ProjectRenderer project={project} MDXBody={MDXBody} />;
}

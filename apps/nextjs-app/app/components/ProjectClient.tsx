"use client";

import { useEffect, useState } from "react";
import { ProjectRenderer } from "./ProjectRenderer";
import { allProjects } from "content-collections";

export function ProjectClient({ slug }: { slug: string }) {
  const [MDXBody, setMDXBody] = useState<any>(null);
  const project = allProjects.find((p) => p.slug === slug);

  useEffect(() => {
    const load = async () => {
      if (!project) return;

      const mod = await import(`../../content/projects/${project.filePath}`);
      setMDXBody(() => mod.default);
    };
    load();
  }, [project]);

  if (!project) return <div>Not Found</div>;
  if (!MDXBody) return <div>Loading...</div>;

  return <ProjectRenderer project={project} MDXBody={MDXBody} />;
}

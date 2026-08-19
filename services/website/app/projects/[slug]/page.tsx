import type { Metadata } from 'next';
import { allProjects } from 'content-collections';
import { ProjectClient } from "../../components/ProjectClient";
import { buildPageMetadata } from '../../config/metadata';

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = allProjects.find((entry) => entry.slug === slug);

  if (!project) {
    return buildPageMetadata({
      title: 'Project not found',
      description: 'The requested project could not be found.',
      path: `/projects/${slug}`,
    });
  }

  return buildPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    image: project.og ?? project.thumb ?? project.hero,
    imageWidth: project.ogWidth ?? project.thumbWidth ?? project.heroWidth,
    imageHeight: project.ogHeight ?? project.thumbHeight ?? project.heroHeight,
    imageAlt: `${project.title} project preview`,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProjectClient slug={slug} />;
}

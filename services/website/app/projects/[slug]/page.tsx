import { allProjects } from 'content-collections';
import { ProjectClient } from "../../components/ProjectClient";

export async function generateStaticParams() {
  return allProjects.map((project) => ({ slug: project.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>
};

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProjectClient slug={slug} />;
}

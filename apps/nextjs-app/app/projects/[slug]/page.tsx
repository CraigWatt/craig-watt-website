import { ProjectClient } from "../../components/ProjectClient";

export async function generateStaticParams() {
  // Don't load allProjects! Just read slugs from the filesystem or hardcode for now.
  return [
    { slug: "craig-watt-website" },
    // other slugs if needed
  ];
}

type PageProps = {
  params: Promise<{ slug: string }>
};

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProjectClient slug={slug} />;
}

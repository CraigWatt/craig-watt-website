import { notFound } from 'next/navigation';
import { BlogClient } from '../../components/BlogClient';

// ONLY import metadata (not the MDX module itself)
import allPosts from 'content-collections/generated/allPosts'

export function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) return notFound();

  return <BlogClient post={post} />;
}

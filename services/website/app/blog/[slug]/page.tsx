import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogClient } from '../../components/BlogClient';
import { buildPageMetadata } from '../../config/metadata';

// ONLY import metadata (not the MDX module itself)
import allPosts from 'content-collections/generated/allPosts'

export function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts.find((entry) => entry.slug === slug);

  if (!post) {
    return buildPageMetadata({
      title: 'Post not found',
      description: 'The requested post could not be found.',
      path: `/blog/${slug}`,
    });
  }

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt ?? post.summary,
    path: `/blog/${post.slug}`,
    image: post.og ?? post.thumb ?? post.hero,
    imageWidth: post.ogWidth ?? post.thumbWidth ?? post.heroWidth,
    imageHeight: post.ogHeight ?? post.thumbHeight ?? post.heroHeight,
    imageAlt: `${post.title} article preview`,
    type: 'article',
    publishedTime: post.date,
  });
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) return notFound();

  return <BlogClient post={post} />;
}

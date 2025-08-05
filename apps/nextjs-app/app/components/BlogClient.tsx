/* eslint-disable @typescript-eslint/no-explicit-any */
// BlogClient.tsx
'use client';

import { useEffect, useState } from 'react';
import allPosts from 'content-collections/generated/allPosts';
import { BlogRenderer } from './BlogRenderer';

// derive the “Post” type from your generated array
type Post = typeof allPosts[number];

type MDXModule = { default: React.ComponentType<{ components: any }> };

interface BlogClientProps {
  post: Post;
}

export function BlogClient({ post }: BlogClientProps) {
  const [MDXBody, setMDXBody] =
    useState<React.ComponentType<{ components: any }> | null>(null);

  useEffect(() => {
    async function load() {
      const mod = (await import(
        `../../content/posts/${post.filePath}`
      )) as MDXModule;
      setMDXBody(() => mod.default);
    }
    load();
  }, [post.filePath]);

  if (!post) return <div>Not Found</div>;
  if (!MDXBody) return <div>Loading…</div>;

  return <BlogRenderer post={post} MDXBody={MDXBody} />;
}

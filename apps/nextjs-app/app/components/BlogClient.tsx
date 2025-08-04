'use client';

import { useEffect, useState } from 'react';
import { BlogRenderer } from './BlogRenderer';

export function BlogClient({ post }: { post: any }) {
  const [MDXBody, setMDXBody] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const mod = await import(`../../content/posts/${post.filePath}`);
      setMDXBody(() => mod.default);
    };
    load();
  }, [post.filePath]);

  if (!post) return <div>Not Found</div>;
  if (!MDXBody) return <div>Loading…</div>;

  return <BlogRenderer post={post} MDXBody={MDXBody} />;
}

import { BlogCard } from '../components/BlogCard';
import posts from '../config/posts'; // your posts array

export default function BlogPage() {
  return (
    <main className="py-16 px-4 md:px-6 space-y-12">
      <h1 className="text-4xl font-bold text-center">Blog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            title={post.title}
            href={`/blog/${post.slug}`}
            excerpt={post.excerpt}
            image={post.thumb}
            date={post.date}
            readingTime={post.readingTime}
            category={post.category}
          />
        ))}
      </div>
    </main>
  );
}

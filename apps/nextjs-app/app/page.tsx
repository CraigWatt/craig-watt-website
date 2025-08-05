// app/page.tsx
'use client';
import { allProjects, allPosts } from 'content-collections';
import { ProjectCard } from './components/ProjectCard';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { User } from '@heroui/user';
import { BlogCard } from './components/BlogCard';
import ContactForm from './components/ContactForm';

const projects = allProjects ?? [];
const posts = allPosts?.filter((p) => p.thumb) ?? [];

export default function App() {
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <main className="space-y-20">
      {/* 1) Hero Section */}
      <section className="relative text-center py-32 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">Hi, I’m Craig Watt.</h1>
          <p className="text-lg mb-6 text-zinc-600 dark:text-zinc-300">
            Observability Engineer by day—crafting monitoring with Grafana,
            Telegraf, and CI/CD—aspiring SRE who enjoys writing about code and
            tackling hard challenges.
          </p>
        </div>
        <div className="flex justify-center gap-6">
          {/* Scroll to #contact */}
          <a href="#contact">
            <Button as="span" variant="solid">
              Get in touch
            </Button>
          </a>
          <Link href="/projects">
            <Button as="span" variant="ghost">
              See All Projects
            </Button>
          </Link>
        </div>
      </section>

      {/* 2) About / Profile */}
      <section className="bg-default/5 dark:bg-default/20 py-16 px-4 md:px-6">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <User
            name="Craig Watt"
            description="Observability Engineer"
            avatarProps={{ src: '/images/avatar.jpg', alt: 'Craig’s avatar' }}
          />
          <p className="text-base leading-relaxed">
            I’m an Observability Engineer at Sky, building and maintaining
            scalable media-asset management systems. I specialize in real-time
            monitoring and automation with Grafana, Telegraf, Docker, and
            Kubernetes. When I’m not tuning pipelines or writing back-end
            services in C and Python, you’ll find me setting up a Raspberry Pi
            k3s cluster, writing code, and tackling complex challenges head-on.
          </p>
        </div>
      </section>

      {/* 3) Featured Projects */}
      <section className="py-16 px-4 md:px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {projects.slice(0, 3).map((p) => (
          <ProjectCard
            key={p.slug}
            title={p.title}
            href={`/projects/${p.slug}`}
            description={p.summary}
            imageSrc={p.thumb ?? p.thumbLg!}
            imageWidth={p.thumbWidth  ?? p.thumbLgWidth!}
            imageHeight={p.thumbHeight ?? p.thumbLgHeight!}
            badges={p.badges}
          />
        ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/projects">
            <Button as="span" variant="ghost">
              See All Projects
            </Button>
          </Link>
        </div>
      </section>

      {/* 4) Blog Teaser */}
      <section className="bg-default/5 dark:bg-default/20 py-16 px-4 md:px-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          From the Blog
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {recentPosts.map((post) => (
          <BlogCard
            key={post.slug ?? 'missing-slug'}
            title={post.title ?? 'Untitled'}
            href={`/blog/${post.slug ?? ''}`}
            excerpt={post.excerpt ?? post.summary ?? ''}
            imageSrc={post.thumb}
            imageWidth={post.thumbWidth!}
            imageHeight={post.thumbHeight!}
            date={post.date ?? '1970-01-01'}
            readingTime={post.readingTime ?? ''}
            category={post.category ?? 'Uncategorized'}
            badges={post.badges ?? []}
          />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/blog">
            <Button as="span" variant="ghost">
              See All Posts
            </Button>
          </Link>
        </div>
      </section>

      {/* 5) Contact Section */}
      <section
        id="contact"
        className="py-16 px-4 md:px-6"
      >
        <h2 className="text-3xl font-semibold text-center mb-8">Contact Me</h2>
        <div className="max-w-xl mx-auto">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}

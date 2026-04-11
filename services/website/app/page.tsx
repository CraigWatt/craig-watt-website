// app/page.tsx
'use client';
import { allProjects, allPosts } from 'content-collections';
import { ProjectCard } from './components/ProjectCard';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { BlogCard } from './components/BlogCard';
import ContactForm from './components/ContactForm';
import Image from 'next/image';

const projects = allProjects ?? [];
const posts = allPosts?.filter((p) => p.thumb) ?? [];

export default function App() {
  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <main className="min-h-screen">
      {/* Hero Section - minimal, left-aligned aesthetic */}
      <section className="relative min-h-[85vh] flex items-center px-6 md:px-12 lg:px-24">
        {/* This div is a placeholder for your future Three.js background */}
        <div className="absolute inset-0 -z-10" id="hero-canvas-container" />
        
        <div className="max-w-4xl">
          <p className="text-[var(--color-muted-foreground)] text-sm uppercase tracking-widest mb-4">
            Platform Engineer focused on observability
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-8 text-balance">
            Craig Watt
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-muted-foreground)] max-w-2xl leading-relaxed mb-12">
            I build and operate production platforms that stay observable, automatable,
            and easy to ship. Right now I&apos;m focused on monitoring systems with{' '}
            <span className="text-[var(--color-accent)] font-medium">Grafana</span>,{' '}
            <span className="text-[var(--color-accent)] font-medium">Telegraf</span>,{' '}
            <span className="text-[var(--color-accent)] font-medium">Kubernetes</span>, and{' '}
            <span className="text-[var(--color-accent)] font-medium">Terraform</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact">
              <Button 
                as="span" 
                className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Get in touch
              </Button>
            </a>
            <Link href="/projects">
              <Button 
                as="span" 
                variant="ghost"
                className="border border-[var(--color-border)] text-[var(--color-foreground)] font-medium px-8 py-3 rounded-lg hover:bg-[var(--color-card)] transition-colors"
              >
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left column - Label */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-4 mb-6 lg:mb-0">
                <div className="section-divider" />
                <span className="text-sm uppercase tracking-widest text-[var(--color-muted)]">About</span>
              </div>
            </div>
            
            {/* Right column - Content */}
            <div className="lg:col-span-9">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-2 ring-[var(--color-border)] flex-shrink-0">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Craig Watt"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <div className="space-y-6">
                  <p className="text-lg md:text-xl leading-relaxed text-[var(--color-foreground)]">
                    I&apos;m an Observability Engineer at{' '}
                    <span className="text-[var(--color-accent)] font-medium">Sky</span>, where I help
                    keep media-asset platforms reliable, visible, and ready to scale.
                  </p>
                  <p className="text-base leading-relaxed text-[var(--color-muted-foreground)]">
                    I specialize in monitoring, automation, and infrastructure work with Grafana,
                    Telegraf, Docker, Kubernetes, and Terraform. When I&apos;m not tuning pipelines or
                    writing backend services in C and Python, you&apos;ll usually find me testing ideas
                    on a Raspberry Pi k3s cluster or improving the systems around the site itself.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[var(--color-card)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="section-divider" />
            <span className="text-sm uppercase tracking-widest text-[var(--color-muted)]">Selected Engineering Work</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((p) => (
              <ProjectCard
                key={p.slug}
                title={p.title}
                href={`/projects/${p.slug}`}
                description={p.summary}
                imageSrc={p.thumb ?? p.thumbLg!}
                imageWidth={p.thumbWidth ?? p.thumbLgWidth!}
                imageHeight={p.thumbHeight ?? p.thumbLgHeight!}
                badges={p.badges}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/projects">
              <Button 
                as="span" 
                variant="ghost"
                className="border border-[var(--color-border)] text-[var(--color-foreground)] font-medium px-8 py-3 rounded-lg hover:bg-[var(--color-background)] transition-colors"
              >
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="section-divider" />
            <span className="text-sm uppercase tracking-widest text-[var(--color-muted)]">Writing</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          
          <div className="mt-16 text-center">
            <Link href="/blog">
              <Button 
                as="span" 
                variant="ghost"
                className="border border-[var(--color-border)] text-[var(--color-foreground)] font-medium px-8 py-3 rounded-lg hover:bg-[var(--color-card)] transition-colors"
              >
                Read All Writing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 px-6 md:px-12 lg:px-24 bg-[var(--color-card)] border-t border-[var(--color-border)]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left column */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 mb-8">
                <div className="section-divider" />
                <span className="text-sm uppercase tracking-widest text-[var(--color-muted)]">Contact</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                Let&apos;s work together
              </h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                If you need help with observability, automation, infrastructure, or platform work,
                I&apos;m always happy to chat.
              </p>
            </div>
            
            {/* Right column - Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

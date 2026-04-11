'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { ArrowRight } from 'lucide-react';
import { experienceTimeline, profilePositioning } from '../data/profile';
import { TechIconRow } from '../components/TechIconRow';

export default function ExperiencePage() {
  const [activeId, setActiveId] = useState(experienceTimeline[0]?.id ?? '');
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const activeIndex = useMemo(
    () => experienceTimeline.findIndex((item) => item.id === activeId),
    [activeId]
  );

  // Track scroll position to fade the sticky sidebar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      
      if (currentScrollY > scrollThreshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-timeline-item]'));
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target instanceof HTMLElement) {
          setActiveId(visible.target.dataset.timelineId ?? experienceTimeline[0].id);
        }
      },
      {
        rootMargin: '-20% 0px -45% 0px',
        threshold: [0.25, 0.5, 0.75],
      }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="px-6 md:px-12 lg:px-24 py-16">
      <div className="mx-auto max-w-7xl space-y-12">
        <section className="grid gap-8 md:gap-12 lg:grid-cols-[0.9fr,1.1fr] items-start">
          <div className={`space-y-6 lg:sticky lg:top-24 transition-opacity duration-300 ${isScrolled ? 'lg:opacity-0 lg:pointer-events-none' : 'lg:opacity-100'}`}>
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
              XP
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-balance">
              A scrollable timeline of the roles that shaped my platform engineering path
            </h1>
            <p className="text-lg leading-relaxed text-[var(--color-muted-foreground)] max-w-xl">
              This page is the chronological version of my story: the Sky years first, then the
              earlier roles that explain how I got there. It is designed to feel more engaging
              than a plain CV while still staying useful for hiring managers.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/cv">
                <Button as="span" className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
                  Open CV
                </Button>
              </Link>
              <Link href="/credentials">
                <Button as="span" variant="flat">
                  View Credentials
                </Button>
              </Link>
            </div>

            <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-card)]">
              <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-3">
                Positioning
              </p>
              <p className="text-lg font-medium leading-relaxed">
                {profilePositioning.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {profilePositioning.summary}
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-card)]">
                <p className="text-2xl font-semibold">{experienceTimeline.length}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">career entries</p>
              </Card>
              <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-card)]">
                <p className="text-2xl font-semibold">1</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">current role</p>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border)]" />
            <div className="space-y-8">
              {experienceTimeline.map((entry, index) => {
                const active = entry.id === activeId;
                const past = activeIndex >= 0 && index < activeIndex;
                return (
                  <article
                    key={entry.id}
                    data-timeline-item
                    data-timeline-id={entry.id}
                    id={entry.id}
                    className={`relative rounded-3xl border p-6 md:p-8 pl-10 md:pl-12 transition-all ${
                      active
                        ? 'border-[var(--color-accent)] bg-[var(--color-card)] shadow-lg'
                        : 'border-[var(--color-border)] bg-[var(--color-card)]/70'
                    }`}
                  >
                    <div
                      className={`absolute left-2 top-8 h-6 w-6 rounded-full border-2 ${
                        active
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                          : past
                            ? 'border-[var(--color-accent)] bg-[var(--color-background)]'
                            : 'border-[var(--color-border)] bg-[var(--color-background)]'
                      }`}
                    />
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                            {entry.period}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="text-[var(--color-accent)]">
                              {entry.icon}
                            </div>
                            <div>
                              <h2 className="text-2xl font-semibold">{entry.title}</h2>
                              <p className="text-sm text-[var(--color-muted-foreground)]">
                                {entry.organisation}
                              </p>
                              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mt-2">
                                {entry.engagement} · {entry.location}
                              </p>
                            </div>
                          </div>
                        </div>
                        {entry.href && (
                          <Link href={entry.href} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
                            View page <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>

                      <p className="text-base leading-relaxed text-[var(--color-muted-foreground)]">
                        {entry.summary}
                      </p>

                      {entry.stackIcons?.length ? (
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                            Stack used
                          </p>
                          <TechIconRow icons={entry.stackIcons} />
                        </div>
                      ) : null}

                      <ul className="space-y-2">
                        {entry.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-[var(--color-foreground)]">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
          <Card className="p-6 border border-[var(--color-border)] bg-[var(--color-card)]">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-3">
              What this page shows
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              The page follows the actual order of your career, with Sky leading because it is the
              strongest proof of the platform engineering story.
            </p>
          </Card>
          <Card className="p-6 border border-[var(--color-border)] bg-[var(--color-card)]">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-3">
              Use cases
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Share this page when you want something more engaging than a CV but more specific
              than a homepage.
            </p>
          </Card>
          <Card className="p-6 border border-[var(--color-border)] bg-[var(--color-card)]">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-3">
              Next step
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Use the CV page when someone wants the same story in a simple printable format.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}

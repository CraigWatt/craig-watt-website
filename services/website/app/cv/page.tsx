'use client';

import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { Download, FileText, Printer, ShieldCheck } from 'lucide-react';
import { coreSkills, experienceTimeline, profilePositioning } from '../data/profile';

export default function CvPage() {
  const printPage = () => window.print();

  return (
    <main className="cv-page px-6 md:px-12 lg:px-24 py-16">
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .site-nav,
          .site-footer,
          .cv-page-controls {
            display: none !important;
          }

          .cv-page {
            padding: 0 !important;
            background: white !important;
          }

          .cv-sheet {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="cv-page-controls mx-auto max-w-6xl mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
            CV export
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-2">Printable resume view</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onPress={printPage}
            className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
            startContent={<Printer className="h-4 w-4" />}
          >
            Save as PDF
          </Button>
          <Link href="/experience">
            <Button as="span" variant="flat" startContent={<FileText className="h-4 w-4" />}>
              Experience
            </Button>
          </Link>
          <Link href="/credentials">
            <Button as="span" variant="flat" startContent={<ShieldCheck className="h-4 w-4" />}>
              Credentials
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <Card className="cv-sheet border border-[var(--color-border)] bg-[var(--color-card)] p-8 md:p-10">
          <header className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
                  Craig Watt
                </p>
                <h2 className="text-4xl md:text-5xl font-semibold text-balance">
                  {profilePositioning.title}
                </h2>
              </div>
              <p className="max-w-xl text-sm md:text-base leading-relaxed text-[var(--color-muted-foreground)]">
                {profilePositioning.summary}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Focus</p>
                <p className="mt-2 text-sm leading-relaxed">
                  Observability, automation, Kubernetes, Terraform, and reliable delivery.
                </p>
              </Card>
              <Card className="border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Format</p>
                <p className="mt-2 text-sm leading-relaxed">
                  Use this page when a recruiter wants a clean PDF copy of the same story.
                </p>
              </Card>
              <Card className="border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Version</p>
                <p className="mt-2 text-sm leading-relaxed">
                  Website first, PDF second, so the online version stays the source of truth.
                </p>
              </Card>
            </div>
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr,1.15fr]">
            <aside className="space-y-8">
              <section>
                <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-4">
                  Core skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {coreSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-4">
                  Credentials
                </p>
                <div className="space-y-3">
                  <Card className="border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-4">
                    <p className="text-sm font-medium">Add your formal certs here</p>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      AWS, Oracle, and any badge that helps prove the depth behind the work.
                    </p>
                  </Card>
                  <Card className="border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-4">
                    <p className="text-sm font-medium">Add awards and recognition here</p>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                      Include the employer or vendor name and a short explanation of why it matters.
                    </p>
                  </Card>
                </div>
              </section>
            </aside>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
                    Selected experience
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    The same story as the timeline page, compressed for a PDF export.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {experienceTimeline.map((entry) => (
                  <Card
                    key={entry.id}
                    className="border border-[var(--color-border)] bg-[var(--color-background)] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                          {entry.period}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">{entry.title}</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {entry.organisation}
                        </p>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                        {entry.kind}
                      </p>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                      {entry.summary}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {entry.bullets.slice(0, 2).map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-sm leading-relaxed">
                          <span className="mt-2 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </Card>
      </div>
    </main>
  );
}

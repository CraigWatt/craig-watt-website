import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { ArrowRight, BadgeCheck, FileText, ShieldCheck } from 'lucide-react';
import { credentialSections } from '../data/profile';

export default function CredentialsPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-16">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
              Creds
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-balance">
              Formal credentials, awards, and proof points in one place
            </h1>
            <p className="text-lg leading-relaxed text-[var(--color-muted-foreground)] max-w-2xl">
              This page is designed to surface the badges and certificates that hiring managers
              care about most, without making them hunt through the rest of the site.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/cv">
                <Button as="span" className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
                  Open CV
                </Button>
              </Link>
              <Link href="/experience">
                <Button as="span" variant="flat">
                  View Experience
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex items-center gap-3 mb-4 text-[var(--color-accent)]">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
                Why it exists
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Credentials are often the fastest way to prove baseline knowledge, while the rest
              of the website shows how that knowledge gets applied in real systems.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">01</p>
                <p className="mt-2 text-sm font-medium">AWS and platform certs</p>
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">02</p>
                <p className="mt-2 text-sm font-medium">Awards and recognition</p>
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">03</p>
                <p className="mt-2 text-sm font-medium">Training, badges, and renewal dates</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {credentialSections.map((section) => (
            <Card
              key={section.id}
              className="border border-[var(--color-border)] bg-[var(--color-card)] p-6"
            >
              <div className="flex items-center gap-3 text-[var(--color-accent)]">
                {section.icon}
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {section.summary}
              </p>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-foreground)]">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          <Card className="border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-4">
              What to add here
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              <li>AWS certification title, issuing body, and expiry date.</li>
              <li>Oracle awards or internal recognition with a short note about the context.</li>
              <li>Any short training badges that strengthen the wider profile.</li>
            </ul>
          </Card>

          <Card className="border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <div className="flex items-center gap-3 text-[var(--color-accent)] mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Best practice</h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Keep this page short and factual. The goal is to make it easy for an employer to
              verify formal proof points, then move straight on to the experience timeline and
              project work.
            </p>
            <div className="mt-6">
              <Link href="/experience" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
                See the experience timeline <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

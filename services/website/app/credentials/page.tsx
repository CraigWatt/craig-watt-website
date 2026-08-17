import { Button, Card } from '@heroui/react';
import { Award, ArrowRight, BadgeCheck, Medal, ShieldCheck } from 'lucide-react';
import { siteUrl } from '../data/site';

export default function CredentialsPage() {
  return (
    <main className="min-h-[72vh] px-6 py-16 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl space-y-12">
        <section className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
            Credentials
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-balance">
            Certifications and recognition
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-muted-foreground)] max-w-xl mx-auto">
            A place for formal credentials, certificates, and awards. Content coming soon.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <Card className="site-surface rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-8 md:p-10 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <Award className="h-8 w-8 text-[var(--color-muted)]" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
                Coming next
              </p>
              <h2 className="text-2xl font-semibold text-balance">
                Certificates, badges, and recognition in one place
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--color-muted-foreground)] lg:mx-0">
                This page is being held for the formal proof behind the work: cloud certifications,
                awards, and the credentials that support the platform engineering story across the rest of the site.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                <p className="mt-4 text-sm font-medium">Cloud certifications</p>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  AWS, Oracle, and any accreditation that proves delivery depth.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <BadgeCheck className="h-5 w-5 text-[var(--color-accent)]" />
                <p className="mt-4 text-sm font-medium">Vendor badges</p>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  Formal recognition tied to the stack I use in practice.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <Medal className="h-5 w-5 text-[var(--color-accent)]" />
                <p className="mt-4 text-sm font-medium">Awards</p>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  Employer or community recognition with clear context.
                </p>
              </div>
            </div>
          </Card>

          <Card className="site-surface rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)] p-8">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <Award className="h-8 w-8 text-[var(--color-muted)]" />
                </div>
              </div>
              <div className="space-y-3 text-center">
                <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
                  Empty state
                </p>
                <p className="text-base font-medium">Credentials will appear here once available</p>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  Until then, the strongest proof of the work lives in the experience timeline and CV export.
                </p>
              </div>
              <div className="grid gap-3">
                <a href={siteUrl('/experience')} className="block">
                  <Button as="span" className="w-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
                    View Experience
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
                <a href={siteUrl('/cv')} className="block">
                  <Button as="span" variant="flat" className="w-full border border-[var(--color-border)] bg-[var(--color-background)]">
                    Open CV
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

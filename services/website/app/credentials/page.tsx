import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { Award, ArrowRight } from 'lucide-react';

export default function CredentialsPage() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <section className="text-center space-y-6">
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

        <Card className="border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-[var(--color-background)] border border-[var(--color-border)] p-4">
              <Award className="h-8 w-8 text-[var(--color-muted)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Credentials will appear here once available
          </p>
        </Card>

        <div className="flex justify-center gap-3">
          <Link href="/experience">
            <Button as="span" className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
              View Experience
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/cv">
            <Button as="span" variant="flat" className="border border-[var(--color-border)]">
              Open CV
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

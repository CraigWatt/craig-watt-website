'use client';
import { useState } from 'react';
import { Form, Input, Textarea, Alert, Progress, Button } from '@heroui/react';

type FormState = { name: string; email: string; message: string };

const fieldClassNames = {
  base: 'w-full',
  inputWrapper:
    'min-h-14 rounded-xl border border-[var(--color-border)] bg-white/95 px-4 py-3 shadow-none transition-colors dark:bg-slate-900/70',
  innerWrapper: 'items-center',
  label: 'text-sm font-medium text-[var(--color-muted-foreground)]',
  input: 'text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]',
} as const;

const textareaClassNames = {
  ...fieldClassNames,
  inputWrapper:
    'min-h-32 rounded-xl border border-[var(--color-border)] bg-white/95 px-4 py-3 shadow-none transition-colors dark:bg-slate-900/70',
  innerWrapper: 'items-start',
} as const;

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    let token: string | undefined;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && typeof window !== 'undefined' && window.grecaptcha?.execute) {
      try {
        token = await window.grecaptcha.execute(siteKey, { action: 'contact' });
      } catch {
        console.warn('reCAPTCHA error');
      }
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed to send');

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err: unknown) {
      console.error('ContactForm error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-6" validationBehavior="aria" aria-live="polite">
      {status === 'success' && (
        <Alert color="success" title="Thank you!" description="I’ll be in touch soon." variant="flat" />
      )}
      {status === 'error' && (
        <Alert color="danger" title="Error" description={errorMsg} variant="flat" isClosable />
      )}
      {status === 'sending' && (
        <Progress
          isIndeterminate
          aria-label="Sending message…"
          className="w-full"
          size="sm"
        />
      )}

      <Input
        name="name"
        label="Name"
        isRequired
        value={form.name}
        onChange={handleChange}
        classNames={fieldClassNames}
      />

      <Input
        name="email"
        label="Email"
        type="email"
        isRequired
        value={form.email}
        onChange={handleChange}
        classNames={fieldClassNames}
      />

      <Textarea
        name="message"
        label="Message"
        isRequired
        value={form.message}
        onChange={handleChange}
        minRows={4}
        classNames={textareaClassNames}
      />

      <div className="text-right">
        <Button type="submit" disabled={status === 'sending'} variant="solid">
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </Form>
  );
}

// app/components/ContactForm.tsx
'use client';
import { useState } from 'react';
import { Button } from '@heroui/react';

type FormState = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    // Get reCAPTCHA token if siteKey is set and grecaptcha is available
    let token: string | undefined;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (
      siteKey &&
      typeof window !== 'undefined' &&
      window.grecaptcha?.execute
    ) {
      try {
        token = await window.grecaptcha.execute(siteKey, { action: 'contact' });
      } catch (recapErr) {
        console.error('reCAPTCHA error:', recapErr);
        // you can choose to abort or proceed without token
      }
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit');
      }
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err: unknown) {
      console.error('ContactForm error:', err);
      let msg = 'An error occurred';
      if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'success' && (
        <p className="text-green-600 dark:text-green-400">
          Thank you! I’ll be in touch soon.
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-600 dark:text-red-400">Error: {errorMsg}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-default/40 dark:border-default/60 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-default/40 dark:border-default/60 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          value={form.message}
          onChange={handleChange}
          className="mt-1 block w-full border border-default/40 dark:border-default/60 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring"
        />
      </div>

      <div className="text-right">
        <Button type="submit" disabled={status === 'sending'} variant="solid">
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
}

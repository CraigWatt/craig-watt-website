// app/components/ContactForm.tsx
'use client';
import { useState } from 'react';

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
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to submit');
      }
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred');
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
      <div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}

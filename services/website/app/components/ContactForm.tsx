'use client';

import { useState } from 'react';
import { Alert, Button, Form, Input, Progress, Textarea } from '@heroui/react';
import { siteInputClassNames, siteTextareaClassNames } from './siteFieldStyles';

type FormState = {
  name: string;
  email: string;
  message: string;
};

type StepKey = keyof FormState;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const steps: Array<{
  key: StepKey;
  title: string;
  prompt: string;
  placeholder: string;
}> = [
  {
    key: 'name',
    title: 'Your name',
    prompt: 'What should I call you?',
    placeholder: 'Craig Watt',
  },
  {
    key: 'email',
    title: 'Your email',
    prompt: 'Where should I reply?',
    placeholder: 'you@example.com',
  },
  {
    key: 'message',
    title: 'Your message',
    prompt: 'What do you need help with?',
    placeholder: 'Tell me a bit about the project, problem, or idea.',
  },
];

function validateField(field: StepKey, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    if (field === 'message') {
      return 'Please enter a message.';
    }
    return `Please enter your ${field}.`;
  }

  if (field === 'email' && !EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const currentStep = steps[stepIndex];
  const currentValue = form[currentStep.key];
  const currentError = validateField(currentStep.key, currentValue);
  const progressValue = ((stepIndex + 1) / steps.length) * 100;

  const handleChange = (value: string) => {
    setForm((prev) => ({ ...prev, [currentStep.key]: value }));
    if (status !== 'idle') {
      setStatus('idle');
    }
    if (errorMsg) {
      setErrorMsg('');
    }
  };

  const moveNext = () => {
    if (currentError) {
      setErrorMsg(currentError);
      setStatus('error');
      return;
    }

    setStatus('idle');
    setErrorMsg('');
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const moveBack = () => {
    setStatus('idle');
    setErrorMsg('');
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const firstInvalid = steps.find((step) => validateField(step.key, form[step.key]));
    if (firstInvalid) {
      setStepIndex(steps.findIndex((step) => step.key === firstInvalid.key));
      setErrorMsg(validateField(firstInvalid.key, form[firstInvalid.key]));
      setStatus('error');
      return;
    }

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
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send');
      }

      setStatus('success');
      setErrorMsg('');
      setForm({ name: '', email: '', message: '' });
      setStepIndex(0);
    } catch (err: unknown) {
      console.error('ContactForm error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="site-surface space-y-6 rounded-[2rem] p-6 md:p-8"
      validationBehavior="aria"
      aria-live="polite"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-muted)]">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 className="text-2xl font-semibold text-[var(--color-foreground)]">
              {currentStep.title}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">{currentStep.prompt}</p>
          </div>
          <div className="hidden rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-muted-foreground)] sm:inline-flex">
            {Math.round(progressValue)}%
          </div>
        </div>

        <Progress
          aria-label="Contact form progress"
          value={progressValue}
          className="w-full"
          size="sm"
        />

        <div className="flex gap-2">
          {steps.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => {
                setStepIndex(index);
                setStatus('idle');
                setErrorMsg('');
              }}
              className={[
                'h-2 flex-1 rounded-full transition-colors',
                index <= stepIndex ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]/50',
              ].join(' ')}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {status === 'success' && (
        <Alert
          color="success"
          title="Thank you"
          description="Your message has been sent. I’ll be in touch soon."
          variant="flat"
        />
      )}

      {status === 'error' && errorMsg && (
        <div className="rounded-[1.5rem] border border-rose-500/30 bg-rose-500/8 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(225,29,72,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">
            Check this step
          </p>
          <p className="mt-2 text-sm leading-relaxed text-rose-700 dark:text-rose-200">
            {errorMsg}
          </p>
        </div>
      )}

      {status === 'sending' && (
        <div className="rounded-[1.5rem] border border-sky-500/25 bg-sky-500/8 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.28)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
            Sending
          </p>
          <p className="mt-2 text-sm text-sky-800 dark:text-sky-100">
            Sending your message now.
          </p>
          <Progress isIndeterminate aria-label="Sending message…" className="mt-4 w-full" size="sm" />
        </div>
      )}

      <div className="space-y-5">
        {status !== 'sending' &&
          (currentStep.key === 'message' ? (
            <Textarea
              key={currentStep.key}
              name="message"
              aria-label="Message"
              isRequired
              value={form.message}
              onValueChange={handleChange}
              minRows={5}
              classNames={siteTextareaClassNames}
            />
          ) : (
            <Input
              key={currentStep.key}
              name={currentStep.key}
              type={currentStep.key === 'email' ? 'email' : 'text'}
              aria-label={currentStep.key === 'name' ? 'Name' : 'Email'}
              isRequired
              value={form[currentStep.key]}
              onValueChange={handleChange}
              classNames={siteInputClassNames}
            />
          ))}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="flat"
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]"
              onPress={moveBack}
              isDisabled={stepIndex === 0 || status === 'sending'}
            >
              Back
            </Button>

            {stepIndex < steps.length - 1 ? (
              <Button
                type="button"
                variant="solid"
                className="rounded-2xl"
                onPress={moveNext}
                isDisabled={status === 'sending'}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="solid"
                className="rounded-2xl"
                isDisabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            )}
          </div>

          {stepIndex === steps.length - 1 && (
            <p className="text-sm text-[var(--color-muted-foreground)]">Final step.</p>
          )}
        </div>
      </div>
    </Form>
  );
}

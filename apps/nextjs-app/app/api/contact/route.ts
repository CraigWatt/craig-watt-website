// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Helper to assert env vars:
function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return v;
}

const mailerSendApiKey = getRequiredEnv('MAILERSEND_API_KEY');
const contactEmailTo = getRequiredEnv('CONTACT_EMAIL_TO');
const contactEmailFrom = getRequiredEnv('CONTACT_EMAIL_FROM');
const recaptchaSecret = process.env.RECAPTCHA_SECRET; // optional

// Initialize MailerSend with assured string key
const mailerSend = new MailerSend({ apiKey: mailerSendApiKey });

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message, token } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // reCAPTCHA logic...
    if (recaptchaSecret) {
      if (!token) {
        return NextResponse.json(
          { error: 'reCAPTCHA token missing' },
          { status: 400 }
        );
      }
      // verify with Google...
      const params = new URLSearchParams();
      params.append('secret', recaptchaSecret);
      params.append('response', token);
      const resp = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        }
      );
      const recaptchaRes = await resp.json();
      if (!recaptchaRes.success) {
        return NextResponse.json(
          { error: 'reCAPTCHA failed' },
          { status: 400 }
        );
      }
      if (recaptchaRes.score !== undefined && recaptchaRes.score < 0.5) {
        return NextResponse.json(
          { error: 'Low reCAPTCHA score' },
          { status: 400 }
        );
      }
    }

    // Prepare email:
    const sentFrom = new Sender(contactEmailFrom, 'Website Contact Form');
    const recipients = [new Recipient(contactEmailTo, 'Craig Watt')];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(new Sender(email, name))
      .setSubject(`New contact from ${name}`)
      .setHtml(
        `
        <p>New contact form submission:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${(message as string).replace(/\n/g, '<br/>')}</p>
      `
      )
      .setText(
        `New contact:\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`
      );

    await mailerSend.email.send(emailParams);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);

    // Narrow `err` as Error to get message, or check for MailerSend structure:
    if (err instanceof Error) {
      // If MailerSend throws with a response property, narrow further:
      // (MailerSend errors may have a `response` field)
      const anyErr = err as unknown as {
        response?: { data?: { message?: string } };
      };
      if (anyErr.response && anyErr.response.data) {
        console.error('MailerSend API Error Details:', anyErr.response.data);
        const msg = anyErr.response.data.message ?? 'Unknown MailerSend error';
        return NextResponse.json(
          { error: `Failed to send email: ${msg}` },
          { status: 500 }
        );
      }
      // Generic Error
      return NextResponse.json(
        { error: `Server error: ${err.message}` },
        { status: 500 }
      );
    }

    // If err is not instanceof Error, fallback
    return NextResponse.json(
      { error: 'Server error: Failed to process submission' },
      { status: 500 }
    );
  }
}

// app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message } = data;
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // TODO: integrate email service here, e.g. SendGrid, Mailgun, or similar.
    // e.g., await sendEmail({ to: 'you@example.com', subject: `Contact from ${name}`, text: message, replyTo: email });
    console.log('Contact form submission:', { name, email, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

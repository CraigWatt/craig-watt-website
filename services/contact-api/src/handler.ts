import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

type HttpEvent = {
  body?: string | null;
  headers?: Record<string, string | undefined>;
  isBase64Encoded?: boolean;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
};

type HttpResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  token?: string;
};

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

function json(statusCode: number, body: unknown): HttpResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getTrimmedEnv(name: string): string {
  return getEnv(name).trim();
}

function parseBody(event: HttpEvent): ContactPayload {
  const rawBody = event.body ?? '{}';
  const decoded = event.isBase64Encoded
    ? Buffer.from(rawBody, 'base64').toString('utf8')
    : rawBody;

  return JSON.parse(decoded) as ContactPayload;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyRecaptcha(secret: string, token: string): Promise<{ ok: boolean; reason?: string }> {
  const params = new URLSearchParams({
    secret,
    response: token,
  });

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    return { ok: false, reason: `reCAPTCHA verification failed with HTTP ${response.status}` };
  }

  const payload = (await response.json()) as {
    success?: boolean;
    score?: number;
  };

  if (!payload.success) {
    return { ok: false, reason: 'reCAPTCHA failed' };
  }

  if (payload.score !== undefined && payload.score < 0.5) {
    return { ok: false, reason: 'Low reCAPTCHA score' };
  }

  return { ok: true };
}

async function sendEmail(payload: {
  to: string;
  from: string;
  name: string;
  email: string;
  message: string;
}) {
  const client = new SESClient({});

  await client.send(new SendEmailCommand({
    Source: payload.from,
    Destination: {
      ToAddresses: [payload.to],
    },
    ReplyToAddresses: [payload.email],
    Message: {
      Subject: {
        Data: `New contact from ${payload.name}`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: `New contact:\nName: ${payload.name}\nEmail: ${payload.email}\nMessage:\n${payload.message}`,
          Charset: 'UTF-8',
        },
        Html: {
          Data: `
            <p>New contact form submission:</p>
            <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(payload.message).replace(/\n/g, '<br/>')}</p>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  }));
}

export async function handler(event: HttpEvent): Promise<HttpResponse> {
  const method = event.requestContext?.http?.method ?? 'GET';

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...JSON_HEADERS,
        allow: 'OPTIONS,POST',
      },
      body: '',
    };
  }

  if (method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const { name, email, message, token } = parseBody(event);

    if (!name || !email || !message) {
      return json(400, { error: 'Missing fields' });
    }

    const safeName = name.trim();
    const safeEmail = email.trim().toLowerCase();
    const safeMessage = message.trim();

    if (!safeName || !safeEmail || !safeMessage) {
      return json(400, { error: 'Missing fields' });
    }

    if (!validateEmail(safeEmail)) {
      return json(400, { error: 'Invalid email address' });
    }

    if (safeName.length > 120 || safeEmail.length > 320 || safeMessage.length > 5000) {
      return json(400, { error: 'Payload exceeds allowed size' });
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      if (!token) {
        return json(400, { error: 'reCAPTCHA token missing' });
      }

      const verification = await verifyRecaptcha(recaptchaSecret, token);
      if (!verification.ok) {
        return json(400, { error: verification.reason ?? 'reCAPTCHA failed' });
      }
    }

    await sendEmail({
      to: getTrimmedEnv('CONTACT_EMAIL_TO'),
      from: getTrimmedEnv('CONTACT_EMAIL_FROM'),
      name: safeName,
      email: safeEmail,
      message: safeMessage,
    });

    return json(200, { ok: true });
  } catch (error) {
    console.error('Contact lambda failed', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Server error: Failed to process submission';

    return json(500, { error: message });
  }
}

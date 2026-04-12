jest.mock('@aws-sdk/client-ses', () => {
  const send = jest.fn();
  return {
    SESClient: jest.fn(() => ({ send })),
    SendEmailCommand: jest.fn((input) => input),
    __mockSend: send,
  };
});

import { handler } from '../src/handler';

const { __mockSend: sendMock } = jest.requireMock('@aws-sdk/client-ses') as {
  __mockSend: jest.Mock;
};

describe('contact lambda handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CONTACT_EMAIL_TO: 'hello@craigwatt.co.uk',
      CONTACT_EMAIL_FROM: 'no-reply@craigwatt.co.uk',
    };
    sendMock.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows preflight requests', async () => {
    const response = await handler({
      requestContext: { http: { method: 'OPTIONS' } },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers.allow).toBe('OPTIONS,POST');
  });

  it('rejects non-post requests', async () => {
    const response = await handler({
      requestContext: { http: { method: 'GET' } },
    });

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toEqual({ error: 'Method not allowed' });
  });

  it('validates the payload and sends a sanitized email', async () => {
    sendMock.mockResolvedValueOnce({});

    const response = await handler({
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify({
        name: '  Craig <Watt>  ',
        email: ' CRAIG@Example.com ',
        message: 'Hello & goodbye\nNext line',
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toMatchObject({
      Source: 'no-reply@craigwatt.co.uk',
      Destination: {
        ToAddresses: ['hello@craigwatt.co.uk'],
      },
      ReplyToAddresses: ['craig@example.com'],
      Message: {
        Subject: {
          Data: 'New contact from Craig <Watt>',
        },
        Body: {
          Text: {
            Data: expect.stringContaining('Message:\nHello & goodbye\nNext line'),
          },
          Html: {
            Data: expect.stringContaining('Hello &amp; goodbye<br/>Next line'),
          },
        },
      },
    });
  });
});

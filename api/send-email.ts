// @ts-ignore - Definindo tipos básicos para compatibilidade sem @vercel/node
interface VercelRequest {
  method: string;
  body: any;
  query: any;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(data: any): VercelResponse;
  setHeader(name: string, value: string): VercelResponse;
  end(): void;
}

interface SendEmailRequest {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { from, to, subject, text, html } = req.body as SendEmailRequest;

  if (!from || !to || !subject || !text || !html) {
    return res.status(400).json({ error: 'Missing required fields: from, to, subject, text, html' });
  }

  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const sendgridFrom = process.env.SENDGRID_FROM;

  if (!sendgridApiKey || !sendgridFrom) {
    console.error('CRITICAL: Email service configuration missing (SENDGRID_API_KEY/SENDGRID_FROM).');
    return res.status(500).json({
      error: 'Serviço de e-mail temporariamente indisponível. Por favor, tente novamente mais tarde.'
    });
  }

  if (from !== sendgridFrom) {
    // For security, enforce sender from config. Ignore incoming `from` on untrusted env.
    console.warn('[send-email] requested from changed to config value');
  }

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: sendgridFrom },
    subject,
    content: [
      { type: 'text/plain', value: text },
      { type: 'text/html', value: html },
    ],
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[send-email] SendGrid error', response.status, errorText);
      return res.status(502).json({ error: 'Failed to send email via SendGrid', details: errorText });
    }

    return res.status(200).json({ success: true, message: 'Email enviado com sucesso pelo SendGrid.' });
  } catch (err: any) {
    console.error('[send-email] Unhandled error', err);
    return res.status(500).json({ error: 'Erro interno ao enviar e-mail', details: err?.message || String(err) });
  }
}

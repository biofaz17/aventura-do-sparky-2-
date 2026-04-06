import dotenv from 'dotenv'
import sgMail from '@sendgrid/mail'

dotenv.config({ path: './.env' })

const apiKey = process.env.SENDGRID_API_KEY
const fromEmail = process.env.SENDGRID_FROM_EMAIL

if (!apiKey) throw new Error('SENDGRID_API_KEY não configurada')
if (!fromEmail) throw new Error('SENDGRID_FROM_EMAIL não configurada')

sgMail.setApiKey(apiKey)

export async function sendEmail({ to, subject, text, html }) {
  if (!to) throw new Error('Destinatário obrigatório')
  if (!subject) throw new Error('Assunto obrigatório')
  if (!text && !html) throw new Error('Informe text ou html')

  const [response] = await sgMail.send({
    to,
    from: fromEmail,
    subject,
    text: text || undefined,
    html: html || undefined,
  })

  return {
    ok: true,
    statusCode: response.statusCode,
  }
}
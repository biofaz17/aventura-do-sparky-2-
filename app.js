import { sendEmail } from './services/sendEmail.js'

try {
  const result = await sendEmail({
    to: 'SEU_EMAIL_AQUI@gmail.com',
    subject: '🔥 Sparky funcionando',
    text: 'Seu sistema de email está ativo.',
    html: '<h1>Sparky rodando 🚀</h1>',
  })

  console.log(result)
} catch (error) {
  console.error(error.message)
}
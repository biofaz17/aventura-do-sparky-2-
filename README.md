<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14QBdtldbdE0nW3Ei27u8lNTl2IZaXrMh

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

### Email confirmation setup (TEKTOK T.I.)

1. Configure email service in `.env.local`:
   - `SENDGRID_API_KEY` (apenas se usar SendGrid)
   - `SENDGRID_FROM` (ex: `noreply@tektok.com`)
   - `VITE_TEKTOK_EMAIL_FROM` (por padrão `noreply@tektok.com`)
   - opcional: `VITE_TEKTOK_EMAIL_API_URL`, default `/api` usa endpoint local `api/send-email`

2. A API de envio de e-mail está em `api/send-email.ts`.
3. O front-end usa `services/emailService.ts` para disparar o template TEKTOK com HTML e texto.

3. Run the app:
   `npm run dev`

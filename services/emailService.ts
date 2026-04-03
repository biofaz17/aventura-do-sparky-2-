export interface ConfirmationEmailData {
  responsibleEmail: string;
  responsibleName?: string;
  playerName: string;
  playerUsername: string;
  initialPassword: string;
  playerAge: number;
  cpf?: string;
  subscriptionTier?: string;
  createdAt?: string;
}

const safe = (value: string | undefined) => (value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const buildTektokConfirmationEmail = (data: ConfirmationEmailData) => {
  const createdAt = data.createdAt || new Date().toLocaleString('pt-BR');
  const responsibleName = data.responsibleName ? safe(data.responsibleName) : 'Responsável';

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; color: #0f172a; background: #f8fafc; padding: 24px;">
      <div style="max-width: 700px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(90deg, #0ea5e9, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">TEKTOK T.I. - Confirmação de Cadastro</h1>
          <p style="margin: 4px 0 0; color: #dbeafe; font-size: 14px;">Sistema de Gestão de Usuários Sparky</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 16px; margin-bottom: 12px;">Olá <strong>${responsibleName}</strong>,</p>
          <p style="font-size: 14px; color: #334155; margin-bottom: 18px;">
            Seu novo acesso foi criado com sucesso no painel TEKTOK T.I. do Sparky.
            Abaixo, seguem os dados do aluno e credenciais de acesso.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tbody>
              <tr style="background: #f1f5f9;"><td style="padding: 10px; font-weight: 600;">Aluno</td><td style="padding: 10px;">${safe(data.playerName)}</td></tr>
              <tr><td style="padding: 10px; font-weight: 600;">Login</td><td style="padding: 10px;">${safe(data.playerUsername)}</td></tr>
              <tr style="background: #f1f5f9;"><td style="padding: 10px; font-weight: 600;">Senha</td><td style="padding: 10px;">${safe(data.initialPassword)}</td></tr>
              <tr><td style="padding: 10px; font-weight: 600;">Idade</td><td style="padding: 10px;">${data.playerAge}</td></tr>
              <tr style="background: #f1f5f9;"><td style="padding: 10px; font-weight: 600;">CPF</td><td style="padding: 10px;">${safe(data.cpf || '—')}</td></tr>
              <tr><td style="padding: 10px; font-weight: 600;">Plano</td><td style="padding: 10px;">${safe(data.subscriptionTier || 'PRO')}</td></tr>
              <tr style="background: #f1f5f9;"><td style="padding: 10px; font-weight: 600;">Data/Hora</td><td style="padding: 10px;">${createdAt}</td></tr>
            </tbody>
          </table>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://app.tektok.com" style="display: inline-block; background: #0ea5e9; color: white; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: bold;">Acessar painel TEKTOK T.I.</a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
            Essa mensagem foi gerada automaticamente pelo sistema de administração TEKTOK T.I. Se você não solicitou esse cadastro, entre em contato imediatamente com o suporte.
          </p>
        </div>

        <div style="background: #f8fafc; text-align: center; padding: 14px 20px; color: #475569; font-size: 12px;">
          <p style="margin: 0;"><strong>TEKTOK T.I.</strong> • A melhor plataforma de gestão de aprendizado em programação criativa.</p>
          <p style="margin: 4px 0 0;">E-mail: suporte@tektok.com • Site: https://tektok.com</p>
        </div>
      </div>
    </div>
  `;

  const text = `
TEKTOK T.I. - Confirmação de Cadastro

Responsável: ${data.responsibleName || 'Responsável'}
Aluno: ${data.playerName}
Login: ${data.playerUsername}
Senha: ${data.initialPassword}
Idade: ${data.playerAge}
CPF: ${data.cpf || '—'}
Plano: ${data.subscriptionTier || 'PRO'}
Criado em: ${createdAt}

Acesse o painel TEKTOK: https://app.tektok.com

Se não foi você, contate suporte@tektok.com
`;

  return { html, text };
};

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  const apiUrl = import.meta.env.VITE_TEKTOK_EMAIL_API_URL || '/api';
  const apiKey = import.meta.env.VITE_TEKTOK_EMAIL_API_KEY;
  const fromAddress = import.meta.env.VITE_TEKTOK_EMAIL_FROM || 'noreply@tektok.com';

  const prepared = buildTektokConfirmationEmail(data);

  const url = apiUrl.replace(/\/+$/, '');
  const endpoint = `${url}/send-email`;

  const payload = {
    from: fromAddress,
    to: data.responsibleEmail,
    subject: `[TEKTOK T.I.] Confirmação de cadastro de ${data.playerName}`,
    text: prepared.text,
    html: prepared.html,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[EmailService] Falha ao enviar email:', response.status, errText);
      return { success: false, message: `Falha ao enviar e-mail: ${response.status}` };
    }

    return { success: true, message: 'E-mail de confirmação enviado com sucesso.' };
  } catch (error: any) {
    console.error('[EmailService] Erro ao chamar API de e-mail:', error);
    return { success: false, message: 'Erro de conexão com serviço de e-mail.' };
  }
}

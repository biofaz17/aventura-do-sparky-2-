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

import dotenv from 'dotenv';
dotenv.config();

const getEnv = (...keys: string[]) => keys.map(key => process.env[key]).find(Boolean);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, title, price, email, userId } = req.body;

  if (!planId || !price || !email || !userId) {
    return res.status(400).json({ error: 'Missing required checkout fields' });
  }

  const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
  let serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

  if (!serviceRoleKey && anonKey) {
    console.warn('⚠️ Using ANON key for checkout API because SERVICE_ROLE_KEY is missing. This is only recommended for local development.');
    serviceRoleKey = anonKey;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    
    console.error('❌ Checkout API failed: Missing environment variables:', missing.join(', '));
    return res.status(500).json({ 
      error: 'Configuração do servidor incompleta',
      details: `Variáveis de ambiente faltando: ${missing.join(', ')}. Verifique as configurações do Vercel.`,
      status: 'config_error'
    });
  }

  try {
    console.log('📡 Forwarding checkout request to Supabase Edge Function...');
    console.log('   URL:', `${supabaseUrl}/functions/v1/create_preference`);
    console.log('   Using key type:', serviceRoleKey === anonKey ? 'ANON_KEY' : 'SERVICE_ROLE_KEY');
    
    // Call the original Edge Function from the backend using the service role key
    const response = await fetch(`${supabaseUrl}/functions/v1/create_preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        planId,
        title,
        price,
        email,
        userId
      })
    });

    console.log('   Supabase response status:', response.status);
    
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Edge Function error:', data);
      console.error('   Status:', response.status);
      console.error('   Response:', JSON.stringify(data, null, 2));
      
      // Provide specific error messages based on status
      let errorMessage = 'Erro na função de pagamento';
      let errorDetails = data.message || data.error || 'Erro desconhecido';
      
      if (response.status === 401) {
        errorMessage = 'Acesso negado à função Supabase';
        errorDetails = 'Verifique se SUPABASE_SERVICE_ROLE_KEY está correta e tem permissões para chamar funções';
      } else if (response.status === 404) {
        errorMessage = 'Função Supabase não encontrada';
        errorDetails = 'A função create_preference não existe ou não está implantada';
      } else if (response.status === 500) {
        errorMessage = 'Erro interno na função Supabase';
        errorDetails = 'Verifique os logs da função create_preference no Supabase';
      }
      
      return res.status(response.status).json({
        error: errorMessage,
        details: errorDetails,
        status: 'supabase_error',
        supabase_status: response.status,
        supabase_response: data
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('❌ Local API Checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to process checkout on server',
      details: error.message,
      status: 'network_error'
    });
  }
}

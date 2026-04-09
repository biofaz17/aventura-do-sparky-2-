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

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase configuration missing on server' });
  }

  try {
    console.log('📡 Forwarding checkout request to Supabase Edge Function...');
    
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

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Edge Function error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('❌ Local API Checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to process checkout on server',
      details: error.message 
    });
  }
}

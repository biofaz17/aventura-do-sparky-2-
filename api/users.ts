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
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env files for local development
dotenv.config();

const getEnv = (...keys: string[]) => keys.map(key => process.env[key]).find(Boolean);

// Try to get SERVICE_ROLE_KEY (production/Vercel)
let supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
let supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY');

// Fallback to ANON_KEY if SERVICE_ROLE not available (development)
const anonKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
if (!supabaseKey && anonKey) {
  console.warn('⚠️ Using SUPABASE_ANON_KEY (development mode). In production, use SUPABASE_SERVICE_ROLE_KEY');
  supabaseKey = anonKey;
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY environment variables');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface UserRecord {
  id: string;
  username: string;
  cpf?: string;
  parent_email?: string;
  password?: string;
  created_at?: string;
  last_active?: number;
  profile_data?: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!supabase) {
    console.error('CRITICAL: Supabase keys missing in environment variables.');
    const missing = [];
    if (!getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL')) missing.push('SUPABASE_URL/VITE_SUPABASE_URL');
    if (!getEnv('SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')) missing.push('SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY');
    
    return res.status(500).json({
      error: `Core service initialization failed. Missing variables: ${missing.join(', ')}. Please check Vercel settings.`
    });
  }

  // Add CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, headers, query } = req;
  const adminPin = headers['x-admin-pin'];
  const systemAdminPin = process.env.ADMIN_PIN || '031415';

  // Security Check: Protect sensitive operations
  // GET with username filter is allowed for login functionality.
  // All other operations require the Admin PIN.
  const isSensitiveOp = method !== 'GET' || !query.username;
  
  if (isSensitiveOp && adminPin !== systemAdminPin) {
    console.warn(`[SECURITY] Unauthorized ${method} attempt to /api/users from ${headers['x-forwarded-for'] || 'unknown'}`);
    return res.status(401).json({ error: 'Acesso restrito. PIN administrativo inválido ou ausente.' });
  }

  try {
    switch (method) {
      case 'GET': {
        // Fetch all users or one by username
        const { username } = req.query;
        let dbQuery = supabase.from('users').select('*');
        
        if (username) {
          dbQuery = dbQuery.eq('username', username as string);
        }
        
        const { data: users, error: fetchError } = await dbQuery.order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching users:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch users' });
        }

        return res.status(200).json({ users });
      }

      case 'POST': {
        // Create user
        const {
          username,
          password,
          cpf,
          parent_email,
          name,
          age,
          subscription = 'PRO'
        } = req.body;

        if (!username || !password || !parent_email || !name) {
          return res.status(400).json({
            error: 'Missing required fields: username, password, parent_email, name'
          });
        }

        const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '');
        const userId = 'user_' + cleanUsername;

        const profileData = {
          id: userId,
          name: name.trim(),
          age: parseInt(age) || 8,
          subscription,
          progress: { unlockedLevels: 1, stars: 0, creativeProjects: 0, totalBlocksUsed: 0, secretsFound: 0 },
          settings: { soundEnabled: true, musicEnabled: true },
          isGuest: false,
          lastActive: Date.now(),
        };

        // Create user in 'users' table (credentials and main record)
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            username: cleanUsername,
            password,
            cpf: cpf?.replace(/\D/g, ''),
            parent_email,
            profile_data: profileData,
            last_active: Date.now()
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user in "users" table:', insertError);
          let errorMsg = 'Failed to create user record';
          
          // Check for duplicate key error (username or ID)
          if (insertError.code === '23505') {
            errorMsg = 'Este nome de usuário já está em uso por outro explorador.';
          }
          
          return res.status(500).json({
            error: errorMsg,
            details: insertError.message
          });
        }

        // Note: Synchronization with the 'profiles' table is now handled automatically
        // by a database trigger (tr_sync_user_to_profile) for maximum reliability.
        
        return res.status(201).json({
          message: 'User created successfully',
          user: newUser
        });
      }

      case 'DELETE': {
        // Delete user
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Missing user id' });
        }

        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          return res.status(500).json({
            error: 'Failed to delete user',
            details: deleteError.message
          });
        }

        return res.status(200).json({ success: true });
      }

      case 'PUT': {
        // Update user
        let { id: updateId, updates, ...directUpdates } = req.body;
        
        // Merge updates from possible 'updates' object or direct fields
        const sourceData = { ...(updates || {}), ...directUpdates };

        if (!updateId || Object.keys(sourceData).length === 0) {
          return res.status(400).json({ error: 'Missing id or updates' });
        }

        // Sanitize to only allow valid columns
        const allowedColumns = ['username', 'password', 'cpf', 'parent_email', 'profile_data', 'last_active'];
        const sanitizedUpdates: any = {};
        
        for (const key of allowedColumns) {
          if (sourceData[key] !== undefined) {
            sanitizedUpdates[key] = sourceData[key];
          }
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(sanitizedUpdates)
          .eq('id', updateId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user in "users" table:', updateError);
          let errorMsg = 'Failed to update user';
          if (updateError.code === '23505') errorMsg = 'Este nome de usuário já está em uso.';
          
          return res.status(500).json({
            error: errorMsg,
            details: updateError.message
          });
        }

        // Note: Synchronization with the 'profiles' table is now handled automatically
        // by a database trigger in the database for maximum consistency.

        return res.status(200).json({ 
          message: 'User updated successfully',
          user: updatedUser 
        });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    });
  }
}
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

// Try to get SERVICE_ROLE_KEY (production/Vercel)
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback to ANON_KEY if SERVICE_ROLE not available (development)
if (!supabaseKey && process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Using SUPABASE_ANON_KEY (development mode). In production, use SUPABASE_SERVICE_ROLE_KEY');
  supabaseKey = process.env.SUPABASE_ANON_KEY;
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
    return res.status(500).json({
      error: 'Core service initialization failed. Please contact the system administrator.'
    });
  }

  // Add CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // List users
        const { data: users, error: selectError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (selectError) {
          console.error('Error fetching users:', selectError);
          return res.status(500).json({ error: 'Failed to fetch users' });
        }

        return res.status(200).json({ users });

      case 'POST':
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
          return res.status(500).json({
            error: 'Failed to create user record',
            details: insertError.message
          });
        }

        // ALSO Create in 'profiles' table for compatibility with other parts of the app
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            name: name.trim(),
            password,
            parent_email,
            age: parseInt(age) || 8,
            subscription: subscription,
            progress: profileData.progress,
            settings: profileData.settings,
            last_active: new Date().toISOString()
          }]);

        if (profileError) {
          console.warn('⚠️ User created in "users" but failed in "profiles":', profileError.message);
          // We don't return error here because the main record was created
        }

        return res.status(201).json({ user: newUser });

      case 'DELETE':
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

      case 'PUT':
        // Update user
        let { id: updateId, updates, ...directUpdates } = req.body;
        
        // If 'updates' is not provided, use all other fields except 'id' as updates
        if (!updates) {
          updates = directUpdates;
        }

        if (!updateId || Object.keys(updates).length === 0) {
          return res.status(400).json({ error: 'Missing id or updates' });
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', updateId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user in "users" table:', updateError);
          return res.status(500).json({
            error: 'Failed to update user',
            details: updateError.message
          });
        }

        // --- SYNC WITH PROFILES TABLE ---
        try {
          // If profile_data was updated, we should update the profiles table too
          if (updates.profile_data) {
            const p = updates.profile_data;
            await supabase
              .from('profiles')
              .update({
                name: p.name,
                age: p.age,
                subscription: p.subscription,
                progress: p.progress,
                settings: p.settings,
                last_active: new Date().toISOString()
              })
              .eq('id', updateId);
          } else {
            // Update individual fields if they were passed
            const profileUpdates: any = {};
            if (updates.password) profileUpdates.password = updates.password;
            if (updates.parent_email) profileUpdates.parent_email = updates.parent_email;
            
            if (Object.keys(profileUpdates).length > 0) {
              await supabase.from('profiles').update(profileUpdates).eq('id', updateId);
            }
          }
        } catch (syncErr) {
          console.warn('⚠️ Sync update to "profiles" failed (non-critical):', syncErr);
        }

        return res.status(200).json({ user: updatedUser });

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
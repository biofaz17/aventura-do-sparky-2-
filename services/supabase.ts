import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key missing. Check .env.local')
}

// Fallback to prevent app crash if keys are missing
// This allows the UI to render and show an error message instead of a blank screen
const isValidUrl = (url: string) => {
    try { return Boolean(new URL(url)); } catch (e) { return false; }
};

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : new Proxy({} as any, {
        get: (target, prop) => {
            // Provide a minimal `auth` stub so calls like `supabase.auth.getSession()` don't throw
            if (prop === 'auth') {
                return {
                    getSession: async () => ({ data: { session: null }, error: { message: 'Supabase não configurado. Verifique as chaves no .env.local' } }),
                    signUp: async (_: { email?: string; password?: string }) => ({ data: null, error: { message: 'Supabase não configurado. Verifique as chaves no .env.local' } }),
                    signInWithPassword: async (_: { email?: string; password?: string }) => ({ data: null, error: { message: 'Supabase não configurado. Verifique as chaves no .env.local' } }),
                    signIn: async (_: any) => ({ data: null, error: { message: 'Supabase não configurado. Verifique as chaves no .env.local' } }),
                    signOut: async () => ({ data: null, error: { message: 'Supabase não configurado. Verifique as chaves no .env.local' } }),
                };
            }

            // Fallback behavior for other properties: return a function that logs and returns a Supabase-like error
            if (typeof prop === 'string' && prop !== 'then') {
                return () => ({ data: null, error: { message: `Supabase não configurado (chamada: ${String(prop)}). Verifique as chaves no .env.local` } });
            }

            return undefined;
        }
    });

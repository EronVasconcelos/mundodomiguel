
import { createClient } from '@supabase/supabase-js';

// As credenciais devem ser configuradas no Vercel como SUPABASE_URL e SUPABASE_ANON_KEY
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Verificamos se o Supabase está realmente configurado com URLs válidas
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  !supabaseUrl.includes('placeholder');

// Inicializamos com fallbacks apenas para evitar erro de construção do objeto, 
// mas usaremos isSupabaseConfigured para bloquear chamadas de rede.
export const supabase = createClient(
  supabaseUrl || 'https://tmp.supabase.co', 
  supabaseAnonKey || 'tmp'
);

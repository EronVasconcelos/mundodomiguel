import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais fornecidas
const supabaseUrl = 'https://lermkipuanltuuxieaqq.supabase.co';
const supabaseAnonKey = 'sb_publishable_1tJqKdRakxgCldSoGaO-2w_zGJ75UPO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
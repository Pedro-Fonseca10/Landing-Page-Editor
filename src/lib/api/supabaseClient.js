import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasValidCreds =
  isValidUrl(supabaseUrl) &&
  typeof supabaseKey === 'string' &&
  supabaseKey.trim().length > 0 &&
  !supabaseKey.includes('<SUBSTITUTE');

const createStubClient = () => ({
  from() {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY).',
    );
  },
});

export const supabase = hasValidCreds
  ? createClient(supabaseUrl, supabaseKey)
  : createStubClient();

export const isSupabaseConfigured = () => hasValidCreds;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const createStubClient = () => {
  console.warn(
    'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para habilitar o backend.',
  );
  return {
    from() {
      throw new Error('Supabase não configurado.');
    },
  };
};

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
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

export const supabase =
  hasValidCreds
    ? createClient(supabaseUrl, supabaseKey)
    : createStubClient();

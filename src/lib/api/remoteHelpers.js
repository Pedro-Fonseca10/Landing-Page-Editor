export const ensureApiSuccess = (error, context) => {
  if (!error) return;
  const message =
    typeof error?.message === 'string'
      ? error.message
      : 'Erro ao comunicar com Supabase';
  throw new Error(context ? `${context}: ${message}` : message);
};

export const withFallback = async (operation, fallback, logMessage) => {
  try {
    return await operation();
  } catch (err) {
    if (!fallback) throw err;
    console.warn(logMessage || 'Supabase indisponível, usando fallback local.', err);
    return await fallback(err);
  }
};

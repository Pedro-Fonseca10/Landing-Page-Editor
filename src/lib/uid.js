// Função para gerar IDs únicos mais robustos
export const uid = () => {
  // Combina timestamp + random para maior unicidade
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${random}`;
};

// Função alternativa para casos onde precisamos de IDs mais simples
export const simpleUid = () => {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

// Função para verificar se um ID já existe em uma lista
export const isUniqueId = (id, existingIds) => {
  return !existingIds.includes(id);
};

// Função para gerar ID único garantindo que não existe na lista
export const generateUniqueId = (existingIds = []) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const newId = uid();
    if (isUniqueId(newId, existingIds)) {
      return newId;
    }
    attempts++;
  }

  // Fallback: usar timestamp + contador se todas as tentativas falharem
  return `fallback-${Date.now()}-${existingIds.length}`;
};

/*  
  Local Storage para salvar e carregar dados
  - usa prefixo 'plp:' para evitar conflitos
  - funções: load(name, fallback), save(name, data)
  - tratamento de erros ao carregar (JSON inválido, etc)
*/

const k = (name) => `plp:${name}`;

export const load = (name, fallback = []) => {
  try {
    const data = localStorage.getItem(k(name));
    const parsed = JSON.parse(data ?? 'null') ?? fallback;
    return parsed;
  } catch (error) {
    console.error(`Erro ao carregar ${name}:`, error);
    return fallback;
  }
};

export const save = (name, data) => {
  localStorage.setItem(k(name), JSON.stringify(data));
};

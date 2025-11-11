/*
  Funções para gerenciar sessão usando localStorage.
  Gera novos IDs únicos conforme necessário.
  Reinicia a sessão após 30 minutos de inatividade.
*/

const K_VISITOR = 'plp:visitor_id';
const K_SESSION = 'plp:session_id';

const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function getVisitorId() {
  let v = localStorage.getItem(K_VISITOR);
  if (!v) {
    v = uid();
    localStorage.setItem(K_VISITOR, v);
  }
  return v;
}

export function getSessionId() {
  // nova sessão se não existir ou após 30 min de inatividade
  const raw = localStorage.getItem(K_SESSION);
  const now = Date.now();
  if (raw) {
    const { id, ts } = JSON.parse(raw);
    if (now - ts < 30 * 60 * 1000) {
      // 30min
      localStorage.setItem(K_SESSION, JSON.stringify({ id, ts: now }));
      return id;
    }
  }
  const id = uid();
  localStorage.setItem(K_SESSION, JSON.stringify({ id, ts: now }));
  return id;
}

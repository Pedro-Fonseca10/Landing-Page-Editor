const K_ORDERS = 'plp:orders';

const getAll = () => JSON.parse(localStorage.getItem(K_ORDERS) || '[]');
const setAll = (rows) => localStorage.setItem(K_ORDERS, JSON.stringify(rows));

const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function createOrder({ lp, amount = 0, descricao_oferta = '' }) {
  const rows = getAll();
  const id = uid();
  const now = new Date().toISOString();
  const order = {
    id_pedido: id,
    lp_id: lp.id,
    descricao_oferta:
      descricao_oferta || lp?.content?.headline || lp?.titulo || 'Oferta',
    valor_total: Number.isFinite(amount) ? Number(amount) : 0,
    status: 'pendente', // RF-12: status inicial pendente
    criado_em: now,
    atualizado_em: now,
  };
  rows.push(order);
  setAll(rows);
  return order;
}

export function updateOrderStatus(id_pedido, status) {
  const rows = getAll();
  const idx = rows.findIndex((r) => r.id_pedido === id_pedido);
  if (idx >= 0) {
    rows[idx] = {
      ...rows[idx],
      status,
      atualizado_em: new Date().toISOString(),
    };
    setAll(rows);
    return rows[idx];
  }
  return null;
}

export function findOrder(id_pedido) {
  return getAll().find((r) => r.id_pedido === id_pedido) ?? null;
}

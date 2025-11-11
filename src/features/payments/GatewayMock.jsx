import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { findOrder } from '../orders/orders';

export default function GatewayMock() {
  const { orderId } = useParams();
  const nav = useNavigate();
  const order = useMemo(() => findOrder(orderId), [orderId]);

  if (!order) return <div className="p-6">Pedido não encontrado.</div>;

  const go = (status) =>
    nav(`/payment/callback?order=${orderId}&status=${status}`);

  return (
    <div className="min-h-screen p-6 grid place-items-center">
      <div className="w-full max-w-lg border rounded-xl p-6 grid gap-4">
        <h1 className="text-2xl">Gateway de Pagamento (simulado)</h1>
        <p className="text-sm text-gray-600">
          Não coletamos dados de cartão aqui. Este fluxo simula um provedor
          externo.
        </p>
        <div className="grid gap-1">
          <div>
            <b>Pedido:</b> {order.id_pedido}
          </div>
          <div>
            <b>Descrição:</b> {order.descricao_oferta}
          </div>
          <div>
            <b>Valor total:</b> R$ {Number(order.valor_total || 0).toFixed(2)}
          </div>
          <div>
            <b>Status atual:</b> {order.status}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="border rounded px-3 py-2"
            onClick={() => go('success')}
          >
            Pagar
          </button>
          <button
            className="border rounded px-3 py-2"
            onClick={() => go('failure')}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

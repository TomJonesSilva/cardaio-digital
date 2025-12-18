'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

type StatusType =
  | 'pendente'
  | 'confirmado'
  | 'preparando'
  | 'pronto'
  | 'entregue';

interface Item {
  nome: string;
  preco_unitario: number;
  quantidade: number;
  acompanhamentos?: string[];
  observacoes?: string;
  itemNumber?: number;
}

interface Pedido {
  numero_pedido: number;
  nome_cliente: string;
  numero_cliente: string;
  items: Item[];
  valor_total: string;
  status: StatusType;
  entrega: 'entrega' | 'retirada';
  endereco?: string | null;
  metodo_pagamento: string;
  criado_em: string;
}

interface Column {
  id: number;
  name: StatusType;
  label: string;
  pedidos: Pedido[];
}

const initialColumns: Column[] = [
  { id: 1, name: 'pendente', label: 'Pendentes', pedidos: [] },
  { id: 2, name: 'confirmado', label: 'Confirmado', pedidos: [] },
  { id: 3, name: 'preparando', label: 'Preparando', pedidos: [] },
  { id: 4, name: 'pronto', label: 'Pronto', pedidos: [] },
  { id: 5, name: 'entregue', label: 'Entregue', pedidos: [] },
];

export default function DashboardPedidos() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [colWidths, setColWidths] = useState<{ [key: number]: number }>({});
  const [draggedPedido, setDraggedPedido] = useState<Pedido | null>(null);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(
    null,
  );
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('cozinha');
  const { user, verificarUsuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checarUsuario = async () => {
      const backendUser = await verificarUsuario(); // usa o cookie enviado automaticamente
      if (
        !backendUser ||
        (backendUser.tipo_user !== 'admin' &&
          backendUser.tipo_user !== 'cozinha')
      ) {
        router.replace('/perfil'); // redireciona se não for autorizado
      } else {
        setIsAuthorized(true); // libera acesso à tela
      }
    };

    checarUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // 🔁 Atualiza pedidos a cada 10 segundos
  useEffect(() => {
    if (!isAuthorized) return;
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 10000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const carregarPedidos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Não autorizado');
      const pedidos: Pedido[] = await res.json();

      const atualizadas = initialColumns.map((col) => ({
        ...col,
        pedidos: pedidos.filter(
          (p) => p.status.toLowerCase() === col.name.toLowerCase(),
        ),
      }));

      setColumns(atualizadas);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const handleDragStart = (pedido: Pedido) => setDraggedPedido(pedido);

  const handleDrop = async (col: Column) => {
    if (!draggedPedido || draggedPedido.status === col.name) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pedidos/${draggedPedido.numero_pedido}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: col.name }),
          credentials: 'include',
        },
      );

      // Atualiza localmente
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id === col.id) {
            return {
              ...c,
              pedidos: [...c.pedidos, { ...draggedPedido, status: col.name }],
            };
          }
          if (c.name === draggedPedido.status) {
            return {
              ...c,
              pedidos: c.pedidos.filter(
                (p) => p.numero_pedido !== draggedPedido.numero_pedido,
              ),
            };
          }
          return c;
        }),
      );
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setDraggedPedido(null);
    }
  };

  // Função para redimensionar colunas
  const startResize = (e: React.MouseEvent, colId: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colId] || 320;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setColWidths((prev) => ({ ...prev, [colId]: Math.max(200, newWidth) }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  if (!isAuthorized) {
    return null; // ou um loading simples enquanto verifica
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-x-auto">
      <div className="flex gap-4 flex-nowrap overflow-x-auto">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
            style={{ width: colWidths[col.id] || 320 }}
            className="flex-shrink-0 flex flex-col bg-white rounded-xl shadow-md min-h-[80vh] border border-gray-200 transition-all relative overflow-auto"
          >
            {/* Handle para redimensionar */}
            <div
              onMouseDown={(e) => startResize(e, col.id)}
              className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20 bg-transparent"
            />

            <h2 className="text-xl font-bold text-center bg-red-600 text-white py-3 rounded-t-xl sticky top-0 z-10">
              {col.label} ({col.pedidos.length})
            </h2>

            <div className="flex flex-col gap-4 p-4 overflow-x-auto">
              {col.pedidos.map((pedido) => (
                <div
                  key={pedido.numero_pedido}
                  draggable
                  onDragStart={() => handleDragStart(pedido)}
                  onClick={() => setPedidoSelecionado(pedido)}
                  className="bg-gray-100 border border-gray-300 p-4 rounded-lg cursor-grab hover:shadow-lg transition-shadow"
                >
                  <div className="font-bold text-lg text-gray-800 mb-1">
                    Pedido #{pedido.numero_pedido}
                  </div>

                  <div className="text-base text-gray-700 space-y-1">
                    {pedido.items.map((item, i) => (
                      <div key={i} className="mb-1">
                        <div className="font-medium">
                          • {item.nome} ({item.quantidade})
                          {item.observacoes && (
                            <span className="text-gray-500">
                              {' '}
                              — {item.observacoes}
                            </span>
                          )}
                        </div>
                        {item.acompanhamentos &&
                          item.acompanhamentos.length > 0 && (
                            <div className="text-gray-500 text-sm ml-4">
                              Acompanhamentos: {item.acompanhamentos.join(', ')}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalhes */}
      {pedidoSelecionado && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setPedidoSelecionado(null)}
        >
          <div
            className="bg-white text-gray-900 rounded-xl shadow-xl p-6 w-[90%] max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Pedido #{pedidoSelecionado.numero_pedido}
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Cliente:</strong> {pedidoSelecionado.nome_cliente}
              </p>
              <p>
                <strong>Telefone:</strong> {pedidoSelecionado.numero_cliente}
              </p>
              {pedidoSelecionado.endereco && (
                <p>
                  <strong>Endereço:</strong> {pedidoSelecionado.endereco}
                </p>
              )}
              <p>
                <strong>Entrega:</strong> {pedidoSelecionado.entrega}
              </p>
              <p>
                <strong>Pagamento:</strong> {pedidoSelecionado.metodo_pagamento}
              </p>
              <p>
                <strong>Total:</strong> R$ {pedidoSelecionado.valor_total}
              </p>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Itens:</h3>
            <ul className="space-y-1 text-sm">
              {pedidoSelecionado.items.map((item, i) => (
                <li key={i}>
                  {item.quantidade}x {item.nome}
                  {item.acompanhamentos && item.acompanhamentos.length > 0 && (
                    <div className="text-gray-500 text-xs">
                      Acompanhamentos: {item.acompanhamentos.join(', ')}
                    </div>
                  )}
                  {item.observacoes && (
                    <div className="text-gray-500 text-xs">
                      Obs: {item.observacoes}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* 🔘 Botão de imprimir */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPedidoSelecionado(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Fechar
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/imprimir/${pedidoSelecionado.numero_pedido}`,
                      {
                        method: 'GET',
                        credentials: 'include',
                      },
                    );
                    if (res.ok) {
                      alert('🖨️ Pedido enviado para impressão com sucesso!');
                      setPedidoSelecionado(null);
                    } else {
                      alert('❌ Erro ao imprimir pedido.');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('⚠️ Erro de conexão com o servidor de impressão.');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Imprimir
              </button>
            </div>

            <button
              onClick={() => setPedidoSelecionado(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* Bottom Navbar */}
      {/* <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />*/}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck } from 'lucide-react';

import Link from 'next/link';

import { useAlert } from '@/context/alert-context';
import { useAuth } from '@/context/auth-context';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuth();

  const { showAlert } = useAlert();

  const statusConfig: Record<
    string,
    { label: string; icon: any; color: string; bg: string }
  > = {
    pendente: {
      label: 'Pendente',
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    confirmado: {
      label: 'Confirmado',
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    preparando: {
      label: 'Preparando',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    pronto: {
      label: 'Pronto',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    entregue: {
      label: 'Entregue',
      icon: Truck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const numeroCliente = user.telefone?.trim(); // ✅ pega telefone do objeto

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pedidos/cliente/${numeroCliente}`,
        );

        if (!response.ok) {
          return showAlert('Erro ao buscar pedidos');
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <h1 className="text-xl font-bold">Meus Pedidos</h1>
      </div>

      {/* Orders List */}
      <div className="flex-1 px-4 py-6 pb-32">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Você ainda não tem pedidos</p>
            <Link href="/">
              <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                Fazer Pedido
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const config =
                statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.numero_pedido}
                  className="bg-white rounded-lg shadow-sm p-6 space-y-4"
                >
                  {/* Header do Pedido */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Número do Pedido</p>
                      <p className="text-2xl font-bold text-red-600">
                        #{order.numero_pedido}
                      </p>
                    </div>
                    <div
                      className={`${config.bg} px-3 py-1 rounded-lg flex items-center gap-2`}
                    >
                      <StatusIcon size={18} className={config.color} />
                      <span className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes do Cliente */}
                  <div className="border-t pt-4">
                    <h2 className="font-bold text-gray-900 mb-2">Cliente</h2>
                    <p className="text-gray-700">
                      <span className="font-medium">Nome:</span>{' '}
                      {order.nome_cliente}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Telefone:</span>{' '}
                      {order.numero_cliente}
                    </p>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="border-t pt-4">
                    <h2 className="font-bold text-gray-900 mb-2">Itens</h2>
                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="border-b pb-2 last:border-b-0 text-gray-700"
                        >
                          <div className="flex justify-between">
                            <span>
                              {item.nome} x{item.quantidade}
                            </span>
                            <span>
                              R${' '}
                              {(item.preco_unitario * item.quantidade).toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          {item.acompanhamentos?.length > 0 && (
                            <p className="text-sm text-gray-500 ml-2">
                              Acompanhamentos: {item.acompanhamentos.join(', ')}
                            </p>
                          )}
                          {item.observacoes && (
                            <p className="text-sm text-gray-500 ml-2">
                              Obs: {item.observacoes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-t mt-3 pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-red-600">
                        R$ {Number(order.valor_total ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Informações de Entrega */}
                  <div className="border-t pt-4">
                    <h2 className="font-bold text-gray-900 mb-2">Entrega</h2>
                    <div className="text-gray-700 space-y-2">
                      <p>
                        <span className="font-medium">Tipo:</span>{' '}
                        {order.entrega === 'retirada'
                          ? 'Retirar no Estabelecimento'
                          : 'Entrega em Casa'}
                      </p>
                      {order.endereco && (
                        <p>
                          <span className="font-medium">Endereço:</span>{' '}
                          {order.endereco}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">
                          Método de Pagamento:
                        </span>{' '}
                        {order.metodo_pagamento === 'dinheiro'
                          ? 'Dinheiro'
                          : order.metodo_pagamento === 'cartao'
                            ? 'Cartão'
                            : 'PIX'}
                      </p>
                      <p>
                        <span className="font-medium">Pago?:</span> {order.pago}
                      </p>
                    </div>
                  </div>

                  {/* Linha do tempo (status visual) */}
                  <div className="border-t pt-4">
                    <h2 className="font-bold text-gray-900 mb-2">
                      Acompanhamento
                    </h2>
                    <div className="space-y-3">
                      {[
                        'pendente',
                        'confirmado',
                        'preparando',
                        'pronto',
                        'entregue',
                      ].map((status, index) => {
                        const isCompleted =
                          [
                            'pendente',
                            'confirmado',
                            'preparando',
                            'pronto',
                            'entregue',
                          ].indexOf(order.status) >= index;
                        const isCurrent = order.status === status;

                        return (
                          <div key={status} className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                isCompleted
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <p
                              className={`font-medium ${
                                isCurrent
                                  ? 'text-red-600'
                                  : isCompleted
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                              }`}
                            >
                              {
                                statusConfig[
                                  status as keyof typeof statusConfig
                                ].label
                              }
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navbar */}
      {/* <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />*/}
    </div>
  );
}

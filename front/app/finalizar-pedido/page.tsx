'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useOrder } from '@/context/order-context';
import { useAuth } from '@/context/auth-context';
import BottomNavbar from '@/components/bottom-navbar';
import { useAlert } from '@/context/alert-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrder();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('pedidos');
  const { showAlert } = useAlert();

  const [metodo_pagamento, setPaymentMethod] = useState<
    'dinheiro' | 'cartao' | 'pix' | undefined
  >(undefined);
  const [deliveryType, setDeliveryType] = useState<
    'retirada' | 'entrega' | undefined
  >(undefined);
  const [endereco, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [restaurantOpen, setRestaurantOpen] = useState(false);

  const baseTotal = getTotalPrice();
  const cardFee = metodo_pagamento === 'cartao' ? items.length * 1 : 0;
  const valor_total = baseTotal + cardFee;

  // Preenche campos se user estiver logado
  useEffect(() => {
    if (user) {
      setName(user.nome ?? '');
      setPhone(user.telefone ?? '');
    }
  }, [user]);

  // Checa se o restaurante está aberto
  useEffect(() => {
    const checkRestaurantOpen = () => {
      const now = new Date();
      const hours = now.getHours();
      setRestaurantOpen(hours >= 6 && hours < 23);
    };

    checkRestaurantOpen();
    const interval = setInterval(checkRestaurantOpen, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFinalize = async () => {
    if (!restaurantOpen) {
      showAlert(
        'O restaurante está fechado. Só é possível fazer pedidos entre 06:00 e 14:00.',
      );
      return;
    }

    if (!name.trim()) {
      showAlert('Por favor, insira seu nome');
      return;
    }

    if (!phone.trim()) {
      showAlert('Por favor, insira seu telefone');
      return;
    }

    if (!deliveryType) {
      showAlert('Por favor, selecione o tipo de entrega (retirada ou entrega)');
      return;
    }

    if (deliveryType === 'entrega' && !endereco.trim()) {
      showAlert('Por favor, insira um endereço para entrega');
      return;
    }

    if (!metodo_pagamento) {
      showAlert('Por favor, selecione um método de pagamento');
      return;
    }

    setIsProcessing(true);

    try {
      // 🔹 Envia apenas os dados essenciais
      const itemsWithIds = items.map((item, index) => ({
        id_produto: item.id_produto, // ✅ ID para o backend buscar o valor real
        quantidade: item.quantity,
        observacoes: item.observations || null,
        acompanhamentos: item.garnishes || [],
        itemNumber: index + 1,
      }));

      const orderData = {
        nome_cliente: name.trim(),
        numero_cliente: phone.trim(),
        items: itemsWithIds,
        metodo_pagamento,
        deliveryType,
        endereco: deliveryType === 'entrega' ? endereco.trim() : null,
        status: 'pendente',
      };

      if (!user) {
        await login(name, phone);
      }

      localStorage.setItem('numero_cliente', phone.trim());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pedidos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        },
      );

      if (!response.ok) throw new Error('Erro ao enviar pedido');

      await response.json();

      // clearCart();
      router.push('/pedidos');
    } catch (error) {
      console.error(error);
      showAlert('Erro ao processar pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Voltar
            </button>
          </div>
        </div>
        <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Finalizar Pedido</h1>
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-red-700 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      {/* Status do Restaurante */}
      <div className="text-center py-3">
        <p
          className={`text-lg font-bold ${restaurantOpen ? 'text-green-500' : 'text-red-500'}`}
        >
          {restaurantOpen ? 'Aberto até às 14:00 horas' : 'Fechado'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 pb-40 space-y-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-bold text-gray-900 mb-3">Informações Pessoais</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-bold text-gray-900 mb-3">Resumo do Pedido</h2>
          <div className="space-y-3 text-sm">
            {items.map((item, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between text-gray-600 mb-1">
                  <span>
                    {item.name} {index + 1} x{item.quantity}
                  </span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.garnishes && item.garnishes.length > 0 && (
                  <p className="text-xs text-gray-500 ml-2">
                    Acompanhamentos: {item.garnishes.join(', ')}
                  </p>
                )}
                {item.observations && (
                  <p className="text-xs text-gray-500 ml-2">
                    Obs: {item.observations}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-bold text-gray-900 mb-3">Método de Pagamento</h2>
          <div className="space-y-3">
            {[
              { id: 'dinheiro', label: 'Dinheiro' },
              { id: 'cartao', label: 'Cartão (+ R$ 1,00 por item)' },
              { id: 'pix', label: 'PIX' },
            ].map((method) => (
              <label
                key={method.id}
                className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-red-600 transition"
                style={{
                  borderColor:
                    metodo_pagamento === method.id ? '#dc2626' : '#e5e7eb',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={metodo_pagamento === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-900">
                  {method.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Type */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-bold text-gray-900 mb-3">Tipo de Entrega</h2>
          <div className="space-y-3">
            {[
              { id: 'retirada', label: 'Retirar no Estabelecimento' },
              { id: 'entrega', label: 'Entrega em Casa' },
            ].map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-red-600 transition"
                style={{
                  borderColor: deliveryType === type.id ? '#dc2626' : '#e5e7eb',
                }}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={type.id}
                  checked={deliveryType === type.id}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-900">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Address Input */}
        {deliveryType === 'entrega' && (
          <div className="bg-white rounded-lg p-4">
            <label className="block font-bold text-gray-900 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, complemento..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-600"
            />
          </div>
        )}

        {/* Total */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>R$ {baseTotal.toFixed(2)}</span>
          </div>
          {cardFee > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Taxa de Cartão:</span>
              <span>R$ {cardFee.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-red-600">R$ {valor_total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Finalize Button */}
      <div
        className={`
        ${
          user && user.tipo_user == 'admin'
            ? 'sticky bottom-4 p-4 bg-white border-t border-gray-200 left-64 right-4'
            : 'fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 left-0 right-0'
        }`}
      >
        <button
          onClick={handleFinalize}
          disabled={!restaurantOpen || isProcessing}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
        </button>
      </div>

      {/* Bottom Navbar */}
      {/* <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />*/}
    </div>
  );
}

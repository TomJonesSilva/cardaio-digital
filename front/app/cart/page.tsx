'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import BottomNavbar from '@/components/bottom-navbar';
import { useAuth } from '@/context/auth-context';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('pedidos');
  const { user } = useAuth();

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }
    setIsCheckingOut(true);
    router.push('/finalizar-pedido');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Sua Sacola</h1>
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-red-700 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 px-4 py-6 pb-32">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Sua sacola está vazia</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        {item.name} {item.itemNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                      {item.garnishes && item.garnishes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Acompanhamentos: {item.garnishes.join(', ')}
                        </p>
                      )}
                      {item.observations && (
                        <p className="text-xs text-gray-500 mt-1">
                          Obs: {item.observations}
                        </p>
                      )}
                      <p className="text-red-600 font-bold mt-2">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg p-4 mt-6 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-red-600">
                  R$ {getTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Checkout Button */}
      {items.length > 0 && (
        <div
          className={`
        ${
          user && user.tipo_user == 'admin'
            ? 'sticky bottom-4 p-4 bg-white border-t border-gray-200 left-64 right-4'
            : 'fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 left-0 right-0'
        }`}
        >
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isCheckingOut ? 'Carregando...' : 'Finalizar Compra'}
          </button>
        </div>
      )}

      {/* Bottom Navbar */}
      {/* <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />*/}
    </div>
  );
}

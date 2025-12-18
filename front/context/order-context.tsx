'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

export interface Order {
  id: string;
  orderNumber: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedOption?: string;
    garnishes?: string[];
    observations?: string;
    itemNumber?: number;
  }>;
  totalPrice: number;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  deliveryType: 'retirada' | 'entrega';
  address?: string;
  status: 'pendente' | 'confirmado' | 'preparando' | 'pronto' | 'entregue';
  customerName: string;
  customerPhone: string;
  createdAt: Date;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState(1000);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    const savedCounter = localStorage.getItem('orderCounter');

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    if (savedCounter) {
      setOrderCounter(Number.parseInt(savedCounter));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('orderCounter', orderCounter.toString());
    }
  }, [orders, orderCounter, isHydrated]);

  const addOrder = (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>,
  ): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      orderNumber: orderCounter,
      createdAt: new Date(),
    };

    setOrders((prevOrders) => [...prevOrders, newOrder]);
    setOrderCounter((prev) => prev + 1);

    return newOrder;
  };

  const getOrder = (id: string) => {
    return orders.find((order) => order.id === id);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status } : order,
      ),
    );
  };

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, getOrder, updateOrderStatus }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}

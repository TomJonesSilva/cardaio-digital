'use client';

import Link from 'next/link';
import { Home, ShoppingBag, User, Coffee } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';

interface BottomNavbarProps {
  // Tornamos opcionais para facilitar o uso global
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function BottomNavbar({
  activeTab,
  setActiveTab,
}: BottomNavbarProps) {
  const { user } = useAuth();
  const [localTab, setLocalTab] = useState('inicio');

  const currentTab = activeTab ?? localTab;
  const changeTab = setActiveTab ?? setLocalTab;

  const baseTabs = [
    { id: 'inicio', label: 'Início', icon: Home, href: '/' },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, href: '/pedidos' },
    { id: 'perfil', label: 'Perfil', icon: User, href: '/perfil' },
  ];
  const tabs =
    user?.tipo_user === 'cozinha'
      ? [
          ...baseTabs,
          {
            id: 'cozinha',
            label: 'Cozinha',
            icon: Coffee,
            href: '/admin/cozinha',
          },
        ]
      : baseTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <Link key={tab.id} href={tab.href}>
              <button
                onClick={() => changeTab(tab.id)}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition"
              >
                <Icon
                  size={24}
                  className={isActive ? 'text-red-600' : 'text-gray-400'}
                />
                <span
                  className={`text-xs font-medium ${isActive ? 'text-red-600' : 'text-gray-600'}`}
                >
                  {tab.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

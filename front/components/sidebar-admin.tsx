'use client';

import Link from 'next/link';
import {
  Home,
  User,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  LineChart,
  Users,
  Settings,
} from 'lucide-react';

interface SidebarAdminProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarAdmin({
  isCollapsed,
  setIsCollapsed,
}: SidebarAdminProps) {
  const menu = [
    { label: 'Início', icon: Home, href: '/admin/home' },
    { label: 'Pedidos', icon: ShoppingBag, href: '/admin/pedidos' },
    { label: 'Cozinha', icon: Coffee, href: '/admin/cozinha' },
    { label: 'Relatório', icon: LineChart, href: '/admin/relatorio' },
    { label: 'Funcionários', icon: Users, href: '/admin/funcionarios' },
    { label: 'Perfil', icon: Settings, href: '/perfil' },
  ];

  return (
    <div
      onDoubleClick={() => setIsCollapsed(!isCollapsed)}
      className={`fixed top-0 left-0 h-screen bg-gray-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Botão recolher */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 rounded-full p-2"
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </button>

      {/* Itens do menu */}
      <nav className="mt-16 flex flex-col gap-3 px-4">
        {menu.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-md"
          >
            <Icon size={22} />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import SidebarAdmin from "./sidebar-admin";
import BottomNavbar from "./bottom-navbar";

export default function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");

  if (user?.tipo_user === "admin")
 {
    return (
      <div className="flex">
        {/* Sidebar apenas */}
        <SidebarAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        {/* Conteúdo da página ajustado */}
        <main
          className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"} p-6`}
        >
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  nome?: string;
  telefone?: string;
  tipo_user: 'admin' | 'cozinha' | 'atendente' | 'cliente';
}

interface AuthContextType {
  user: User | null;
  login: (nome: string, telefone: string) => Promise<void>;
  logout: () => void;
  updateProfile: (nome: string, telefone: string) => void;
  isLoading: boolean;
  verificarUsuario: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Carrega o usuário salvo
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('numero_cliente');
        localStorage.removeItem('telefone');
      }
    }
  }, []);

  // 🔹 Login
  const login = async (nome: string, telefone: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, telefone }),
          credentials: 'include',
        },
      );

      if (!response.ok) throw new Error('Erro ao fazer login');

      const data = await response.json();

      // ✅ Cria o objeto user com base no tipo de usuário
      const userData: User = {
        tipo_user: data.tipo_user,
        nome: data.tipo_user !== 'cliente' ? data.nome : nome, // usa nome do back se for funcionário
        telefone: data.tipo_user !== 'cliente' ? data.telefone : telefone, // idem
      };

      setUser(userData);

      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Atualiza perfil (somente cliente)
  const updateProfile = (nome: string, telefone: string) => {
    if (!user) return;
    if (user.tipo_user !== 'cliente') {
      return;
    }

    const updatedUser = { ...user, nome, telefone };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      if (user?.tipo_user === 'cliente') {
        // 🔹 Cliente não tem JWT — apenas limpa os dados locais
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('numero_cliente');
        localStorage.removeItem('telefone');
        return;
      }
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // MUITO IMPORTANTE para enviar o cookie
      });
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('numero_cliente');
      localStorage.removeItem('telefone');
    }
  };

  const verificarUsuario = async () => {
    try {
      // 1️⃣ Primeiro verifica se já tem usuário salvo localmente
      const localUser = localStorage.getItem('user');

      if (!localUser) {
        // 2️⃣ Se não houver ninguém logado, apenas retorna null
        return null;
      }

      const parsedUser = JSON.parse(localUser);
      // 2️⃣ Se o tipo do usuário for "cliente", não precisa checar no backend
      if (parsedUser.tipo_user === 'cliente') {
        setUser(parsedUser);
        return parsedUser;
      }

      // 3️⃣ Se  for outro tipo (admin), verifica no backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        {
          method: 'GET',
          credentials: 'include', // envia cookies automaticamente
        },
      );

      if (!res.ok) throw new Error('Token inválido ou expirado');

      const backendUser = await res.json();
      setUser(backendUser);
      localStorage.setItem('user', JSON.stringify(backendUser)); // salva no localStorage
      return backendUser;
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('numero_cliente');
      localStorage.removeItem('telefone');
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        isLoading,
        verificarUsuario, // <-- adiciona aqui
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

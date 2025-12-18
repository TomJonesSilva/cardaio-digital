'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, login, logout, isLoading } = useAuth();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    try {
      if (!nome.trim() || !telefone.trim()) {
        setError('Por favor, preencha todos os campos');
        setLoginLoading(false);
        return;
      }

      await login(nome, telefone);

      // Aguarda um pequeno delay para garantir que o user foi salvo
      setTimeout(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);

          if (userData.tipo_user === 'cozinha') {
            router.push('/admin/cozinha');
          } else if (userData.tipo_user === 'admin') {
            router.push('/admin/home');
          } else {
            router.push('/');
          }
        }
      }, 200);
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setNome('');
    setTelefone('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Perfil</h1>
      </div>

      <div className="max-w-md mx-auto p-6">
        {user ? (
          // Usuário logado
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {user.nome?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-800">{user.nome}</h2>
              <p className="text-gray-600">{user.telefone}</p>

              {/* Mostra o tipo de usuário */}
              <span className="inline-block mt-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                {user.tipo_user === 'admin'
                  ? 'Administrador'
                  : user.tipo_user === 'atendente'
                    ? 'Atendente'
                    : user.tipo_user === 'cozinha'
                      ? 'Cozinha'
                      : 'Cliente'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        ) : (
          // Formulário de login
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Fazer Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  disabled={loginLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Digite seu telefone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  disabled={loginLoading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading || isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loginLoading || isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAlert } from '@/context/alert-context';

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  senha: string;
  tipo_user: string;
}

interface FuncionarioContextType {
  funcionario: Funcionario[];
  carregarFuncionario: () => Promise<void>;
  criarFuncionario: (dados: Omit<Funcionario, 'id'>) => Promise<void>;
  atualizarFuncionario: (
    id: number,
    dados: Partial<Funcionario>,
  ) => Promise<void>;
  excluirFuncionario: (id: number) => Promise<void>;
}

const UsuarioContext = createContext<FuncionarioContextType | undefined>(
  undefined,
);

export const FuncionarioProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [funcionario, setFuncionario] = useState<Funcionario[]>([]);
  const { showAlert } = useAlert();
  const carregarFuncionario = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      const data = await res.json();
      setFuncionario(data);
    } catch (err) {
      console.error(err);
      showAlert('Falha ao carregar usuários.');
    }
  };

  const criarFuncionario = async (dados: Omit<Funcionario, 'id'>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao criar usuário');
      await carregarFuncionario();
      showAlert('Usuário criado com sucesso!');
    } catch (err) {
      console.error(err);
      showAlert('Falha ao criar usuário.');
    }
  };

  const atualizarFuncionario = async (
    id: number,
    dados: Partial<Funcionario>,
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/usuario/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dados),
        },
      );
      if (!res.ok) throw new Error('Erro ao atualizar usuário');
      await carregarFuncionario();
      showAlert('Usuário atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      showAlert('Falha ao atualizar usuário.');
    }
  };

  const excluirFuncionario = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/usuario/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      if (!res.ok) throw new Error('Erro ao excluir usuário');
      await carregarFuncionario();
      showAlert('Usuário excluído com sucesso!');
    } catch (err) {
      console.error(err);
      showAlert('Falha ao excluir usuário.');
    }
  };

  return (
    <UsuarioContext.Provider
      value={{
        funcionario,
        carregarFuncionario,
        criarFuncionario,
        atualizarFuncionario,
        excluirFuncionario,
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

export const useFuncionarios = () => {
  const context = useContext(UsuarioContext);
  if (!context)
    throw new Error('useUsuarios deve ser usado dentro de UsuarioProvider');
  return context;
};

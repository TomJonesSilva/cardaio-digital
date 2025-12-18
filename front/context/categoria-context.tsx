'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAlert } from '@/context/alert-context';
export type Categoria = {
  id: number;
  nome: string;
  descricao: string;
  imagem: string;
  preco: string;
  ativo: boolean;
};

type CategoriaContextType = {
  categorias: Categoria[];
  carregarCategorias: () => Promise<void>;
  criarCategoria: (dados: Omit<Categoria, 'id'>) => Promise<void>;
  atualizarCategoria: (id: number, dados: Partial<Categoria>) => Promise<void>;
  deletarCategoria: (id: number) => Promise<void>;
  alternarAtivo: (id: number, ativo: boolean) => Promise<void>;
  carregando: boolean;
};

const CategoriaContext = createContext<CategoriaContextType | undefined>(
  undefined,
);

export function CategoriaProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(false);
  const { showAlert } = useAlert();

  // 🔹 Carregar todas as categorias
  const carregarCategorias = async () => {
    setCarregando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`, {
        method: 'GET',
      });

      if (!res.ok) throw new Error('Erro ao buscar categorias');

      const data = await res.json();
      if (Array.isArray(data)) {
        setCategorias(data);
      } else {
        console.error('Formato inesperado:', data);
        setCategorias([]);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      showAlert('Erro ao carregar categorias. Tente novamente.');
      setCategorias([]);
    } finally {
      setCarregando(false);
    }
  };

  // 🔹 Criar categoria
  const criarCategoria = async (dados: Omit<Categoria, 'id'>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao criar categoria');
      await carregarCategorias();
      showAlert('Categoria criada com sucesso!');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao criar categoria.');
    }
  };

  // 🔹 Atualizar categoria
  const atualizarCategoria = async (id: number, dados: Partial<Categoria>) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categorias/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dados),
        },
      );
      if (!res.ok) throw new Error('Erro ao atualizar categoria');
      await carregarCategorias();
      showAlert('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao atualizar categoria.');
    }
  };

  // 🔹 Deletar categoria
  const deletarCategoria = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categorias/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      if (!res.ok) throw new Error('Erro ao deletar categoria');
      await carregarCategorias();
      showAlert('Categoria removida.');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao excluir categoria.');
    }
  };

  // 🔹 Ativar/desativar categoria
  const alternarAtivo = async (id: number, ativo: boolean) => {
    await atualizarCategoria(id, { ativo });
  };

  // 🔹 Carrega ao iniciar
  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <CategoriaContext.Provider
      value={{
        categorias,
        carregarCategorias,
        criarCategoria,
        atualizarCategoria,
        deletarCategoria,
        alternarAtivo,
        carregando,
      }}
    >
      {children}
    </CategoriaContext.Provider>
  );
}

export function useCategorias() {
  const context = useContext(CategoriaContext);
  if (!context) {
    throw new Error('useCategorias deve ser usado dentro de CategoriaProvider');
  }
  return context;
}

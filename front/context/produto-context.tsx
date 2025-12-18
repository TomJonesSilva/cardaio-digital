'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAlert } from '@/context/alert-context';
export type Produto = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  categoriaId: number;
  ativo: boolean;
  descricao?: string;
  acompanhamentos?: string[];
};

type ProdutoContextType = {
  produtos: Produto[];
  carregarProdutos: (categoriaId?: number) => Promise<void>;
  criarProduto: (dados: Omit<Produto, 'id'>) => Promise<void>;
  atualizarProduto: (id: number, dados: Partial<Produto>) => Promise<void>;
  deletarProduto: (id: number) => Promise<void>;
  alternarAtivo: (id: number, ativo: boolean) => Promise<void>;
  carregando: boolean;
};

const ProdutoContext = createContext<ProdutoContextType | undefined>(undefined);

export function ProdutoProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const { showAlert } = useAlert();

  // 🔹 Carregar produtos, opcionalmente por categoria
  const carregarProdutos = async (categoriaId?: number) => {
    setCarregando(true);
    try {
      const url = categoriaId
        ? `${process.env.NEXT_PUBLIC_API_URL}/produtos/${categoriaId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/produtos/0`; // caso queira pegar todos ou ajustar no backend
      const res = await fetch(url, { method: 'GET' });

      if (!res.ok) throw new Error('Erro ao buscar produtos');

      const data = await res.json();
      if (Array.isArray(data)) {
        const normalizados = data.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          preco: parseFloat(p.preco),
          imagem: p.imagem,
          categoriaId: p.categoria_id, // 👈 converte aqui
          ativo: p.ativo,
          descricao: p.descricao,
          acompanhamentos: p.acompanhamentos,
        }));
        setProdutos(normalizados);
      } else {
        console.error('Formato inesperado:', data);
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showAlert('Erro ao carregar produtos. Tente novamente.');
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  };

  // 🔹 Criar produto
  const criarProduto = async (dados: Omit<Produto, 'id'>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao criar produto');
      await carregarProdutos(dados.categoriaId);
      showAlert('Produto criado com sucesso!');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao criar produto.');
    }
  };

  // 🔹 Atualizar produto
  const atualizarProduto = async (id: number, dados: Partial<Produto>) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/produtos/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dados),
        },
      );
      if (!res.ok) throw new Error('Erro ao atualizar produto');
      await carregarProdutos(dados.categoriaId);
      showAlert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao atualizar produto.');
    }
  };

  // 🔹 Deletar produto
  const deletarProduto = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/produtos/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      if (!res.ok) throw new Error('Erro ao deletar produto');
      await carregarProdutos();
      showAlert('Produto removido.');
    } catch (error) {
      console.error(error);
      showAlert('Falha ao excluir produto.');
    }
  };

  // 🔹 Ativar/desativar produto
  const alternarAtivo = async (id: number, ativo: boolean) => {
    await atualizarProduto(id, { ativo });
  };

  // 🔹 Carrega produtos na primeira renderização (todos)
  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <ProdutoContext.Provider
      value={{
        produtos,
        carregarProdutos,
        criarProduto,
        atualizarProduto,
        deletarProduto,
        alternarAtivo,
        carregando,
      }}
    >
      {children}
    </ProdutoContext.Provider>
  );
}

// Hook para usar o contexto
export function useProdutos() {
  const context = useContext(ProdutoContext);
  if (!context) {
    throw new Error('useProdutos deve ser usado dentro de ProdutoProvider');
  }
  return context;
}

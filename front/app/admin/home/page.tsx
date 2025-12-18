'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import PickupSection from '@/components/pickup-section';
import CategorySelector from '@/components/category-selector';
import ProductCard from '@/components/product-card';
import { useCart } from '@/context/cart-context';
import { useCategorias, Categoria } from '@/context/categoria-context';
import { useAuth } from '@/context/auth-context';
import { ShoppingCart, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const {
    categorias,
    carregarCategorias,
    criarCategoria,
    atualizarCategoria,
    deletarCategoria,
  } = useCategorias();
  const { verificarUsuario, user } = useAuth();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    imagem: '',
    ativo: true,
  });
  useEffect(() => {
    const checarUsuario = async () => {
      const backendUser = await verificarUsuario(); // usa o cookie enviado automaticamente
      if (!backendUser || backendUser.tipo_user !== 'admin') {
        router.replace('/perfil'); // redireciona se não for autorizado
      } else {
        setIsAuthorized(true); // libera acesso à tela
      }
    };

    checarUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // 🔹 Verifica o usuário e carrega categorias
  useEffect(() => {
    if (!isAuthorized) return;
    const init = async () => {
      await carregarCategorias();
    };

    init();
  }, [isAuthorized]);

  // 🔹 Filtragem das categorias
  const filteredCategories =
    selectedCategory === 'Todas'
      ? categorias
      : categorias.filter((cat) => cat.nome === selectedCategory);

  // 🔹 Abrir modal (criar ou editar)
  const abrirModal = (categoria: Categoria | null = null) => {
    if (categoria) {
      setEditando(categoria);
      setFormData({
        nome: categoria.nome,
        descricao: categoria.descricao,
        preco: categoria.preco,
        imagem: categoria.imagem,
        ativo: categoria.ativo,
      });
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        imagem: '',
        ativo: true,
      });
    }
    setMostrarModal(true);
  };

  // 🔹 Salvar categoria (criar ou atualizar)
  const salvarCategoria = async () => {
    if (editando) {
      await atualizarCategoria(editando.id, formData);
    } else {
      await criarCategoria(formData);
    }
    setMostrarModal(false);
    await carregarCategorias();
  };
  const handleConfirmarExclusao = async () => {
    if (!editando) return;
    await deletarCategoria(editando.id);
    setConfirmandoExclusao(false);
    setMostrarModal(false);
    await carregarCategorias();
  };

  if (!isAuthorized) {
    return null; // ou um loading simples enquanto verifica
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Conteúdo principal */}
      <div className="flex-1 pb-32">
        <Header restaurantName="Tempero de Mainha" />
        <PickupSection />

        {/* Seletor de categorias */}
        <CategorySelector onCategoryChange={setSelectedCategory} />

        {/* Botão de adicionar item  */}

        <div className="px-4 mt-4 flex justify-end">
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            <PlusCircle size={20} />
            Adicionar Item
          </button>
        </div>

        {/* Seção das categorias */}
        <div className="px-4 py-6 space-y-6">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => (
              <div key={cat.id}>
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    cat.ativo ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {cat.nome}
                </h2>

                {/* Clique direito para editar (apenas admin) */}
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    abrirModal(cat);
                  }}
                >
                  <Link
                    href={`/admin/cardapio/${cat.id}`}
                    className={
                      !cat.ativo ? 'opacity-50 pointer-events-none' : ''
                    }
                  >
                    <ProductCard
                      product={{
                        id: String(cat.id),
                        title: cat.nome,
                        description: cat.descricao,
                        price: cat.preco || '',
                        image: cat.imagem || '/placeholder.jpg',
                        category: cat.nome,
                      }}
                    />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 py-12">
              Nenhuma categoria encontrada
            </div>
          )}
        </div>
      </div>

      {/* Carrinho  */}
      {totalItems > 0 && (
        <Link href="/cart" className="fixed bottom-24 right-4 z-40">
          <button className="bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition flex items-center gap-2">
            <ShoppingCart size={24} />
            <span className="text-sm font-bold">{totalItems}</span>
          </button>
        </Link>
      )}

      {/* Modal de criação/edição */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          {/* Confirmação de exclusão */}
          {confirmandoExclusao && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Tem certeza que deseja excluir?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Esta ação não poderá ser desfeita.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setConfirmandoExclusao(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarExclusao}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal principal */}
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 relative z-40">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome || ''}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <textarea
                placeholder="Descrição"
                value={formData.descricao || ''}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Preço"
                value={formData.preco || ''}
                onChange={(e) =>
                  setFormData({ ...formData, preco: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="URL da imagem"
                value={formData.imagem || ''}
                onChange={(e) =>
                  setFormData({ ...formData, imagem: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) =>
                    setFormData({ ...formData, ativo: e.target.checked })
                  }
                />
                <span>Ativo</span>
              </div>
            </div>

            {/* Botões do rodapé */}
            <div className="flex justify-between mt-6">
              {editando && (
                <button
                  onClick={() => setConfirmandoExclusao(true)}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  Excluir
                </button>
              )}

              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarCategoria}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

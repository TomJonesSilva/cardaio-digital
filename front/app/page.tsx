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
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    imagem: '',
    ativo: true,
  });

  // 🔹 Verifica o usuário e carrega categorias
  useEffect(() => {
    const init = async () => {
      const backendUser = await verificarUsuario();
      if (backendUser && backendUser.tipo_user === 'admin') {
        router.replace('/admin/home'); // redireciona se não for autorizado
      }
      await carregarCategorias();
    };

    init();
  }, []);

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

  const isAdmin = user?.tipo_user === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Conteúdo principal */}
      <div className="flex-1 pb-32">
        <Header restaurantName="Tempero de Mainha" />
        {/* <PickupSection />*/}

        {/* Seletor de categorias */}
        <CategorySelector onCategoryChange={setSelectedCategory} />

        {/* Botão de adicionar item (somente admin) */}
        {isAdmin && (
          <div className="px-4 mt-4 flex justify-end">
            <button
              onClick={() => abrirModal()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              <PlusCircle size={20} />
              Adicionar Item
            </button>
          </div>
        )}

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
                    if (isAdmin) {
                      e.preventDefault();
                      abrirModal(cat);
                    }
                  }}
                >
                  <Link
                    href={`/cardapio/${cat.id}`}
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
    </div>
  );
}

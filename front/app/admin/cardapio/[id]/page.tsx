'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useProdutos, Produto } from '@/context/produto-context';

export default function LunchDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '');
  const router = useRouter();
  const { items: cartItems, addItem } = useCart();
  const { user } = useAuth();
  const {
    produtos,
    carregarProdutos,
    criarProduto,
    atualizarProduto,
    deletarProduto,
  } = useProdutos();

  const [selectedItems, setSelectedItems] = useState<
    Record<string, { quantities: Array<{ garnishes: string[] }> }>
  >({});
  const [observations, setObservations] = useState('');
  const [editando, setEditando] = useState<Produto | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [observationsByItem, setObservationsByItem] = useState<
    Record<string, string[]>
  >({});
  const [acompanhamentosSelecionados, setAcompanhamentosSelecionados] =
    useState<Record<string, string[][]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [flashError, setFlashError] = useState<Record<string, boolean>>({});
  const { verificarUsuario } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
    nome: '',
    preco: 0.0,
    imagem: '',
    categoriaId: Number(id),
    descricao: '',
    ativo: true,
    acompanhamentos: [],
  });
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // 🔹 Carrega produtos da categoria ao montar
  useEffect(() => {
    carregarProdutos(Number(id));
  }, [id]);

  const options = produtos.filter((p) => p.categoriaId === Number(id));

  // 🔹 Modal de criação/edição
  const abrirModal = (produto: Produto | null = null) => {
    if (!isAuthorized) return;
    if (produto) {
      setEditando(produto);
      setFormData({
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        categoriaId: produto.categoriaId,
        ativo: produto.ativo,
        descricao: produto.descricao || '',
        acompanhamentos: produto.acompanhamentos || [],
      });
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        preco: 0.0,
        imagem: '',
        categoriaId: Number(id),
        ativo: true,
        descricao: '',
        acompanhamentos: [],
      });
    }
    setMostrarModal(true);
  };

  const salvarProduto = async () => {
    if (editando) {
      await atualizarProduto(editando.id, formData);
    } else {
      await criarProduto(formData);
    }
    setMostrarModal(false);
    await carregarProdutos(Number(id));
  };

  const handleConfirmarExclusao = async () => {
    if (!editando) return;
    await deletarProduto(editando.id);
    setConfirmandoExclusao(false);
    setMostrarModal(false);
    await carregarProdutos(Number(id));
  };

  const handleSelectOption = (produtoId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [produtoId]: {
        quantities: [...(prev[produtoId]?.quantities || []), { garnishes: [] }],
      },
    }));
    // adiciona um campo de observação vazio para o novo item
    setObservationsByItem((prev) => ({
      ...prev,
      [produtoId]: [...(prev[produtoId] || []), ''],
    }));
  };

  const handleDecreaseQuantity = (produtoId: string) => {
    setSelectedItems((prev) => {
      const item = prev[produtoId];
      if (!item || item.quantities.length === 0) return prev;
      const newQuantities = item.quantities.slice(0, -1);
      if (newQuantities.length === 0) {
        const newItems = { ...prev };
        delete newItems[produtoId];
        return newItems;
      }
      return { ...prev, [produtoId]: { quantities: newQuantities } };
    });
    // remover observação correspondente
    setObservationsByItem((prev) => {
      const updated = { ...prev };
      if (updated[produtoId]?.length) {
        updated[produtoId] = updated[produtoId].slice(0, -1);
        if (updated[produtoId].length === 0) delete updated[produtoId];
      }
      return updated;
    });
  };

  const handleAddToCart = () => {
    let hasError = false;
    const newErrors: Record<string, boolean> = {};

    // Valida se todos os acompanhamentos obrigatórios foram selecionados
    Object.entries(selectedItems).forEach(([produtoId, data]) => {
      const produto = options.find((o) => String(o.id) === produtoId);
      const acompanhamentos: string[] =
        (produto?.acompanhamentos as string[] | undefined) || [];

      data.quantities.forEach((_, index) => {
        const selecionadosParaUnidade: string[] =
          acompanhamentosSelecionados[produtoId]?.[index] || [];

        if (
          acompanhamentos.length > 0 &&
          selecionadosParaUnidade.length === 0
        ) {
          hasError = true;
          newErrors[produtoId] = true;

          // Ativa animação de flash temporário
          setFlashError((prev) => ({ ...prev, [produtoId]: true }));
          setTimeout(() => {
            setFlashError((prev) => ({ ...prev, [produtoId]: false }));
          }, 1000); // duração total da animação
        }
      });
    });

    if (hasError) {
      setErrors(newErrors);

      // Rola para o primeiro acompanhamento que não foi marcado
      const firstErrorId = Object.keys(newErrors)[0];
      document
        .getElementById(`acomp-${firstErrorId}`)
        ?.scrollIntoView({ behavior: 'smooth' });

      return; // não adiciona itens ao carrinho
    }

    // Limpa erros se passou na validação
    setErrors({});

    // Adiciona todos os itens ao carrinho (cada um único)
    Object.entries(selectedItems).forEach(([produtoId, data]) => {
      const selected = options.find((o) => String(o.id) === produtoId);
      if (!selected) return;

      data.quantities.forEach((_, index) => {
        const garnishes = [
          ...(acompanhamentosSelecionados[produtoId]?.[index] || []),
        ];

        addItem({
          id: `${produtoId}-${Date.now()}-${Math.random()}`, // cada item é único
          id_produto: Number(produtoId),
          name: selected.nome,
          price: Number(selected.preco),
          quantity: 1,
          category: id,
          garnishes,
          observations,
          itemNumber: index + 1,
        });
      });
    });

    // Redireciona ou faz qualquer ação pós-adicionar
    router.push('/admin/home');
  };
  const getTotalPrice = () =>
    Object.entries(selectedItems).reduce((total, [produtoId]) => {
      const selected = options.find((o) => String(o.id) === produtoId);
      const quantity = selectedItems[produtoId].quantities.length;
      return total + (Number(selected?.preco) || 0) * quantity;
    }, 0);
  if (!isAuthorized) {
    return null; // ou um loading simples enquanto verifica
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-b from-red-600 to-red-500 h-64 flex items-center justify-center">
          <img
            src="/almoco-banner.jpg"
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          <X size={24} className="text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 pb-8">
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cardápio</h1>

        {/* Botão criar produto (somente admin) */}

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} /> Adicionar Produto
          </button>
        </div>

        {/* Lista de produtos */}
        <div className="space-y-4">
          {options.length > 0 ? (
            options.map((produto) => {
              const quantity =
                selectedItems[String(produto.id)]?.quantities.length || 0;
              const isInactive = !produto.ativo;

              return (
                <div
                  key={produto.id}
                  className={`border rounded-lg p-4 flex items-center gap-4 transition relative ${
                    isInactive
                      ? 'opacity-50 cursor-default' // admin ainda pode clicar com botão direito
                      : 'hover:border-red-600'
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    abrirModal(produto);
                  }}
                >
                  <div
                    className={`flex items-center gap-4 w-full ${
                      isInactive ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isInactive) {
                        handleSelectOption(String(produto.id));
                      }
                    }}
                  >
                    <img
                      src={produto.imagem || '/placeholder.svg'}
                      alt={produto.nome}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p
                        className={`font-bold ${isInactive ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        {produto.nome}
                      </p>
                      {produto.acompanhamentos &&
                        produto.acompanhamentos.length > 0 && (
                          <p className="mt-2 text-sm text-gray-600">
                            Acompanhamentos:{' '}
                            {produto.acompanhamentos.join(', ')}
                          </p>
                        )}
                      {produto.descricao && (
                        <p
                          className={`text-sm ${isInactive ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          {produto.descricao}
                        </p>
                      )}
                      <p
                        className={`font-bold ${isInactive ? 'text-gray-500' : 'text-red-600'}`}
                      >
                        R$ {Number(produto.preco).toFixed(2)}
                      </p>
                    </div>

                    {!isInactive && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecreaseQuantity(String(produto.id));
                          }}
                          disabled={quantity === 0}
                          className="p-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={20} />
                        </button>
                        <span className="w-6 text-center">{quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOption(String(produto.id));
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-600 text-center py-12">
              Nenhum produto cadastrado
            </p>
          )}
        </div>
      </div>

      {/* Campos de acompanhamentos para cada item adicionado (1 bloco por unidade) */}
      {Object.entries(selectedItems).map(([produtoId, data]) => {
        const produto = options.find((o) => String(o.id) === produtoId);
        const acompanhamentos: string[] =
          (produto?.acompanhamentos as string[] | undefined) || [];

        return (
          <div
            key={produtoId}
            id={`acomp-${produtoId}`}
            className={`mt-2 bg-white p-4 rounded-lg shadow-sm transition-all ${
              flashError[produtoId] ? 'animate-error' : ''
            }`}
          >
            {errors[produtoId] && (
              <p className="text-red-600 text-sm mt-1">
                ⚠️ Escolha os acompanhamentos antes de continuar
              </p>
            )}
            <h3 className="font-semibold text-gray-800 mb-3">
              Acompanhamentos para {produto?.nome || produtoId}
            </h3>

            {data.quantities.map((_, index) => {
              // selecionados para esta unidade (garantir array)
              const selecionadosParaUnidade: string[] =
                (acompanhamentosSelecionados[produtoId] &&
                  acompanhamentosSelecionados[produtoId][index]) ||
                [];

              return (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Item {index + 1}
                  </h4>

                  {acompanhamentos.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhum acompanhamento configurado para este produto.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {acompanhamentos.map((acomp, i) => {
                        // normaliza para detectar 'feijao' sem acento
                        const norm = acomp
                          .normalize('NFD')
                          .replace(/\p{Diacritic}/gu, '')
                          .toLowerCase();
                        const isFeijao = norm.includes('feijao');

                        const isChecked =
                          selecionadosParaUnidade.includes(acomp);

                        // verifica se existe outro feijão selecionado nesta unidade (diferente deste)
                        const outroFeijaoSelecionado =
                          selecionadosParaUnidade.some((a) => {
                            const na = a
                              .normalize('NFD')
                              .replace(/\p{Diacritic}/gu, '')
                              .toLowerCase();
                            return na.includes('feijao') && a !== acomp;
                          });

                        return (
                          <label
                            key={i}
                            className={`flex items-center gap-2 px-3 py-1 border rounded-lg cursor-pointer ${
                              isChecked
                                ? 'bg-red-50 border-red-300'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={
                                isFeijao && outroFeijaoSelecionado && !isChecked
                              }
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAcompanhamentosSelecionados((prev) => {
                                  // cópia segura e inicializações
                                  const copia: Record<string, string[][]> = {
                                    ...prev,
                                  };
                                  if (!copia[produtoId]) copia[produtoId] = [];
                                  if (!copia[produtoId][index])
                                    copia[produtoId][index] = [];

                                  const atuais = [...copia[produtoId][index]]; // array de strings

                                  let novos: string[] = [];

                                  if (checked) {
                                    if (isFeijao) {
                                      // remove outros feijões primeiro
                                      novos = atuais.filter((a) => {
                                        const na = a
                                          .normalize('NFD')
                                          .replace(/\p{Diacritic}/gu, '')
                                          .toLowerCase();
                                        return !na.includes('feijao');
                                      });
                                      // adiciona este feijão
                                      novos.push(acomp);
                                    } else {
                                      // adiciona sem duplicatas
                                      novos = atuais.includes(acomp)
                                        ? atuais
                                        : [...atuais, acomp];
                                    }
                                  } else {
                                    // desmarcando
                                    novos = atuais.filter((a) => a !== acomp);
                                  }

                                  copia[produtoId][index] = novos;
                                  return copia;
                                });
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{acomp}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="mb-28" />

      {/* Footer */}
      {Object.keys(selectedItems).length > 0 && (
        <div
          className={`
        ${
          user && user.tipo_user == 'admin'
            ? 'sticky bottom-4 p-4 bg-white border-t border-gray-200 left-64 right-4'
            : 'fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 left-0 right-0'
        }`}
        >
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
          >
            Adicionar ao Carrinho - R$ {getTotalPrice().toFixed(2)}
          </button>
        </div>
      )}

      {/* Modal admin */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          {confirmandoExclusao && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Tem certeza que deseja excluir?
                </h3>
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

          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 relative z-40">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Descrição do produto"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 resize-none"
                rows={3}
              />

              <input
                type="number"
                step="0.01"
                placeholder="Preço"
                value={formData.preco === 0 ? '' : formData.preco}
                onChange={(e) =>
                  setFormData({ ...formData, preco: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="URL da imagem"
                value={formData.imagem}
                onChange={(e) =>
                  setFormData({ ...formData, imagem: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              {/* Campo de acompanhamentos */}
              <div className="space-y-2">
                <label className="font-medium text-gray-700">
                  Acompanhamentos
                </label>

                {/* Lista de acompanhamentos */}
                {formData.acompanhamentos &&
                formData.acompanhamentos.length > 0 ? (
                  formData.acompanhamentos.map((acomp, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={acomp}
                        onChange={(e) => {
                          const novos = [...(formData.acompanhamentos || [])]; // ✅ garante []
                          novos[index] = e.target.value;
                          setFormData({ ...formData, acompanhamentos: novos });
                        }}
                        className="flex-1 border rounded-lg px-3 py-2"
                        placeholder={`Acompanhamento ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const novos = (formData.acompanhamentos || []).filter(
                            (_, i) => i !== index,
                          );
                          setFormData({ ...formData, acompanhamentos: novos });
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhum acompanhamento adicionado
                  </p>
                )}

                {/* Botão adicionar novo acompanhamento */}
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      acompanhamentos: [
                        ...(formData.acompanhamentos || []),
                        '',
                      ],
                    })
                  }
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                >
                  + Adicionar acompanhamento
                </button>
              </div>

              {/* Checkbox ativo */}
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

            {/* Botões de ação */}
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
                  onClick={salvarProduto}
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

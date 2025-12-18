'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useProdutos, Produto } from '@/context/produto-context';

export default function LunchDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '');

  const { items: cartItems, addItem } = useCart();
  const { produtos, carregarProdutos } = useProdutos();

  const [selectedItems, setSelectedItems] = useState<
    Record<string, { quantities: Array<{ garnishes: string[] }> }>
  >({});
  const [observations, setObservations] = useState('');
  const router = useRouter();
  const [observationsByItem, setObservationsByItem] = useState<
    Record<string, string[]>
  >({});
  const [acompanhamentosSelecionados, setAcompanhamentosSelecionados] =
    useState<Record<string, string[][]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [flashError, setFlashError] = useState<Record<string, boolean>>({});

  // 🔹 Carrega produtos da categoria ao montar
  useEffect(() => {
    carregarProdutos(Number(id));
  }, [id]);

  const options = produtos.filter((p) => p.categoriaId === Number(id));

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
    router.push('/');
  };

  const getTotalPrice = () =>
    Object.entries(selectedItems).reduce((total, [produtoId]) => {
      const selected = options.find((o) => String(o.id) === produtoId);
      const quantity = selectedItems[produtoId].quantities.length;
      return total + (Number(selected?.preco) || 0) * quantity;
    }, 0);

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
                      ? // admin ainda pode clicar com botão direito
                        'opacity-50 pointer-events-none' // usuário comum bloqueado totalmente
                      : 'hover:border-red-600'
                  }`}
                  onContextMenu={(e) => {}}
                >
                  <div
                    className={`flex items-center gap-4 w-full ${
                      isInactive ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
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
                      Nenhum acompanhamento para este produto.
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
          className={
            'fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 left-0 right-0'
          }
        >
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
          >
            Adicionar ao Carrinho - R$ {getTotalPrice().toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
}

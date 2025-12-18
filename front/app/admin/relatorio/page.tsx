'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { generateColors } from '@/utils/colors';
import { useRouter } from 'next/navigation';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
);

interface ItemReport {
  nome: string;
  quantidade: number;
  total: number;
}

interface PedidoReport {
  pedido_id: number;
  total_valor: number;
  itens: { nome: string; quantidade: number; preco: number }[];
}

interface ReportData {
  totalPedidos: number;
  totalItens: number;
  faturamentoTotal: number;
  itens: ItemReport[];
  pedidos: PedidoReport[];
}

interface GraficoPizzaItem {
  name: string;
  value: number;
}

interface GraficoLinhaItem {
  dia: string;
  total: number;
}

export default function RelatorioPage() {
  const { user, verificarUsuario } = useAuth();
  const [report, setReport] = useState<ReportData | null>(null);
  const [graficoPizza, setGraficoPizza] = useState<GraficoPizzaItem[]>([]);
  const [graficoLinha, setGraficoLinha] = useState<GraficoLinhaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'todos'>(
    'hoje',
  );
  const colors = generateColors(graficoPizza.length);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 🔐 Protege a rota
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
  }, [router]); // só depende do router

  useEffect(() => {
    if (!isAuthorized) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const queryPeriod =
          period === 'hoje'
            ? 'day'
            : period === 'semana'
              ? 'week'
              : period === 'mes'
                ? 'month'
                : 'all';

        // Requisições paralelas
        const [resResumo, resPizza, resLinha] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/relatorio/resumo?period=${queryPeriod}`,
            {
              method: 'GET',
              credentials: 'include',
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/relatorio/graficopizza?period=${queryPeriod}`,
            {
              method: 'GET',
              credentials: 'include',
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/relatorio/graficolinha?period=${queryPeriod}`,
            {
              method: 'GET',
              credentials: 'include',
            },
          ),
        ]);

        if (!resResumo.ok || !resPizza.ok || !resLinha.ok) {
          throw new Error('Erro ao buscar dados do relatório');
        }

        const resumoData = await resResumo.json();
        const pizzaData = await resPizza.json();
        const linhaData = await resLinha.json();

        // Garante que sejam arrays válidos
        setReport(resumoData);
        setGraficoPizza(Array.isArray(pizzaData) ? pizzaData : []);
        setGraficoLinha(Array.isArray(linhaData) ? linhaData : []);
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [period, isAuthorized]);

  if (!isAuthorized) {
    return null; // ou um loading simples enquanto verifica
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 mb-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Relatório de Pedidos</h1>
      </div>

      {/* Filtros de período */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {['hoje', 'semana', 'mes', 'todos'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              period === p
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {p === 'hoje'
              ? 'Hoje'
              : p === 'semana'
                ? 'Semana'
                : p === 'mes'
                  ? 'Mês'
                  : 'Todos'}
          </button>
        ))}
      </div>

      {loading || !report ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <>
          {/* Resumo geral */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-500 font-medium">Total de Pedidos</p>
              <p className="text-2xl font-bold text-red-600">
                {report.totalPedidos}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-500 font-medium">Total de Itens</p>
              <p className="text-2xl font-bold text-red-600">
                {report.totalItens}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-gray-500 font-medium">Faturamento Total</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {report.faturamentoTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Pizza */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-bold text-gray-800 mb-4 text-center">
                Participação de Itens no Faturamento
              </h2>
              {graficoPizza.length > 0 ? (
                <Pie
                  data={{
                    labels: graficoPizza.map((i) => i.name),
                    datasets: [
                      {
                        data: graficoPizza.map((i) => i.value),
                        backgroundColor: colors,
                      },
                    ],
                  }}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Sem dados para exibir
                </p>
              )}
            </div>

            {/* Linha */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-bold text-gray-800 mb-4 text-center">
                Tendência de Pedidos
              </h2>
              {graficoLinha.length > 0 ? (
                <Line
                  data={{
                    labels: graficoLinha.map((p) => p.dia),
                    datasets: [
                      {
                        label: 'Pedidos por dia',
                        data: graficoLinha.map((p) => p.total),
                        borderColor: 'var(--chart-1)',
                        backgroundColor: 'rgba(200,50,50,0.1)',
                        tension: 0.3,
                      },
                    ],
                  }}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Sem dados para exibir
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

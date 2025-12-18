import { Injectable } from '@nestjs/common';
import { PostgresService } from 'src/db/db.service';

@Injectable()
export class RelatorioService {
  constructor(private readonly postgresService: PostgresService) {}

  async getResumo(period: 'day' | 'week' | 'month' | 'all') {
    let whereClause = '';
    if (period === 'day') whereClause = `WHERE data >= CURRENT_DATE`;
    else if (period === 'week')
      whereClause = `WHERE data >= NOW() - INTERVAL '7 days'`;
    else if (period === 'month')
      whereClause = `WHERE data >= NOW() - INTERVAL '1 month'`;

    const query = `SELECT * FROM pedidos_resumidos ${whereClause}`;
    const result = await this.postgresService.query(query);
    const pedidos = result.rows;

    // Total de pedidos
    const totalPedidos = pedidos.length;

    // Total de itens e valor por item
    const itensMap: Record<string, { quantidade: number; total: number }> = {};
    let totalItens = 0;
    let faturamentoTotal = 0;

    pedidos.forEach((pedido) => {
      faturamentoTotal += Number(pedido.total_valor);

      // Se o campo itens vier como string JSON, faz o parse
      const itens = Array.isArray(pedido.itens)
        ? pedido.itens
        : JSON.parse(pedido.itens);

      itens.forEach((item: any) => {
        const nome = item.produto || item.name; // garante compatibilidade
        const quantidade = Number(item.quantidade) || 0;
        const preco = Number(item.preco) || 0;

        totalItens += quantidade;

        if (!itensMap[nome]) {
          itensMap[nome] = { quantidade: 0, total: 0 };
        }

        itensMap[nome].quantidade += quantidade;
        itensMap[nome].total += quantidade * preco;
      });
    });

    return {
      totalPedidos,
      totalItens,
      faturamentoTotal,
      itens: Object.entries(itensMap).map(([nome, item]) => ({
        nome,
        quantidade: item.quantidade,
        total: item.total,
      })),
    };
  }

  // Dados para gráfico de pizza (participação de cada item no faturamento)
  async getGraficoPizza(period: 'day' | 'week' | 'month' | 'all') {
    const resumo = await this.getResumo(period);
    const data = resumo.itens.map((item) => ({
      name: item.nome,
      value: item.total,
    }));
    return data;
  }

  // Dados para gráfico de linha (número de pedidos por dia)
  async getGraficoLinha(period: 'day' | 'week' | 'month' | 'all') {
    let whereClause = '';
    if (period === 'day') whereClause = `WHERE data >= CURRENT_DATE`;
    else if (period === 'week')
      whereClause = `WHERE data >= NOW() - INTERVAL '7 days'`;
    else if (period === 'month')
      whereClause = `WHERE data >= NOW() - INTERVAL '1 month'`;

    const query = `
      SELECT date_trunc('day', data) as dia, COUNT(*) as total
      FROM pedidos_resumidos
      ${whereClause}
      GROUP BY dia
      ORDER BY dia ASC
    `;
    const result = await this.postgresService.query(query);
    return result.rows.map((row) => ({
      dia: row.dia,
      total: Number(row.total),
    }));
  }
}

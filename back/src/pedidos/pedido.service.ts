import { Injectable } from '@nestjs/common';
import { PostgresService } from 'src/db/db.service';
import { Cron } from '@nestjs/schedule';

interface ItemComPreco {
  id_produto: number;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  subtotal: number;
  observacoes?: string;
  acompanhamentos?: any;
  itemNumber: number;
}
@Injectable()
export class PedidoService {
  constructor(private readonly postgresService: PostgresService) {}

  async createPedido(data: any) {
    const {
      nome_cliente,
      numero_cliente,
      items,
      metodo_pagamento,
      deliveryType,
      endereco,
      status,
    } = data;

    const itensComPreco: ItemComPreco[] = [];
    let valor_total = 0;
    for (const item of items) {
      const {
        id_produto,
        quantidade,
        observacoes,
        acompanhamentos,
        itemNumber,
      } = item;

      // Busca o produto pelo ID
      const produtoResult = await this.postgresService.query(
        `SELECT nome, preco FROM produtos WHERE id = $1`,
        [id_produto],
      );

      if (produtoResult.rows.length === 0) {
        throw new Error(`Produto com ID ${id_produto} não encontrado`);
      }

      const produto = produtoResult.rows[0];

      const subtotal = produto.preco * quantidade;
      valor_total += subtotal;

      itensComPreco.push({
        id_produto,
        nome: produto.nome,
        preco_unitario: produto.preco,
        quantidade,
        subtotal,
        observacoes,
        acompanhamentos,
        itemNumber,
      });
    }
    // ✅ Se o método de pagamento for "cartao", adiciona R$1 por item pedido
    if (metodo_pagamento === 'cartao') {
      valor_total += items.length * 1; // R$1 por item
    }
    // 🔹 Conta quantos pedidos já existem hoje (mantém seu código original)
    const countResult = await this.postgresService.query(
      `SELECT COUNT(*) + 1 AS numero_pedido
     FROM pedidos
     WHERE DATE(criado_em) = CURRENT_DATE;`,
    );

    const numero_pedido = countResult.rows[0].numero_pedido;

    // 🔹 Insere o pedido no banco
    const result = await this.postgresService.query(
      `INSERT INTO pedidos (
      numero_pedido,
      nome_cliente,
      numero_cliente,
      items,
      valor_total,
      status,
      entrega,
      endereco,
      metodo_pagamento
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
      [
        numero_pedido,
        nome_cliente,
        numero_cliente,
        JSON.stringify(itensComPreco), // agora salva com preços válidos
        valor_total,
        status || 'pendente',
        deliveryType,
        endereco,
        metodo_pagamento,
      ],
    );

    return result.rows[0];
  }

  async getPedidos() {
    const result = await this.postgresService.query(
      'SELECT * FROM pedidos WHERE DATE(criado_em) = CURRENT_DATE ORDER BY criado_em DESC',
    );
    return result.rows;
  }

  async getPedido(numero_pedido: number) {
    const result = await this.postgresService.query(
      'SELECT * FROM pedidos WHERE numero_pedido = $1 AND DATE(criado_em) = CURRENT_DATE',
      [numero_pedido],
    );
    return result.rows[0];
  }

  async getPedidosByCliente(numero_cliente: string) {
    const query = `
      SELECT *
      FROM pedidos
      WHERE numero_cliente = $1
      ORDER BY criado_em DESC
    `;

    const { rows } = await this.postgresService.query(query, [numero_cliente]);
    return rows;
  }

  async updatePedido(id: number, data: any) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    const setString = fields.map((f, i) => `${f}=$${i + 1}`).join(', ');

    const result = await this.postgresService.query(
      `UPDATE pedidos
     SET ${setString}
     WHERE numero_pedido=$${fields.length + 1}
      AND DATE(criado_em) = CURRENT_DATE RETURNING *`,
      [...values, id],
    );

    const pedidoAtualizado = result.rows[0];

    if (data.status === 'pronto' && pedidoAtualizado) {
      const existeResumo = await this.postgresService.query(
        `SELECT 1 FROM pedidos_resumidos
       WHERE pedido_id = $1
       AND DATE(data) = CURRENT_DATE
       LIMIT 1`,
        [id],
      );

      if (existeResumo.rows.length === 0) {
        const total_valor = parseFloat(pedidoAtualizado.valor_total);
        const itens = pedidoAtualizado.items.map((item: any) => ({
          produto: item.nome,
          quantidade: item.quantidade,
          preco: item.preco_unitario,
        }));

        await this.postgresService.query(
          `INSERT INTO pedidos_resumidos (pedido_id, data, total_valor, itens)
         VALUES ($1, NOW(), $2, $3)`,
          [id, total_valor, JSON.stringify(itens)],
        );
      }
    }

    return pedidoAtualizado;
  }

  async deletePedido(id: number) {
    const result = await this.postgresService.query(
      'DELETE FROM pedidos WHERE id = $1 RETURNING *',
      [id],
    );
    return result.rows[0];
  }

  /*
  @Cron('0 0 * * *') // formato: minuto hora dia mes diaDaSemana
  async limparPedidosDiariamente() {
    try {
      await this.postgresService.query(
        'TRUNCATE TABLE pedidos RESTART IDENTITY CASCADE;',
      );
      console.log('✅ Tabela "pedidos" limpa automaticamente à meia-noite.');
    } catch (err) {
      console.error('❌ Erro ao limpar pedidos automaticamente:', err);
    }
  }
    */
}

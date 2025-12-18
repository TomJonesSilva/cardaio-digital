import { Injectable } from '@nestjs/common';
import { PostgresService } from 'src/db/db.service';
const escpos = require('escpos');
escpos.Network = require('escpos-network');

// Escolha o tipo de conexão conforme sua impressora:
//escpos.USB = require('escpos-usb');// se for usar porta usb
// escpos.Network = require('escpos-network'); // se for impressora de rede
@Injectable()
export class ImpressaoService {
  constructor(private readonly postgresService: PostgresService) {}
  async imprimirPedido(numero_pedido: number) {
    // 1️⃣ Busca o pedido no banco
    const result = await this.postgresService.query(
      'SELECT * FROM pedidos WHERE numero_pedido = $1 AND DATE(criado_em) = CURRENT_DATE',
      [numero_pedido],
    );

    if (result.rows.length === 0) {
      throw new Error('Pedido não encontrado');
    }

    const pedido = result.rows[0];

    // 2️⃣ Formata o texto do cupom
    const textoCupom = this.formatarCupom(pedido);

    // 3️⃣ Envia para a impressora térmica
    const device = new escpos.Network('192.168.0.150');
    const printer = new escpos.Printer(device);

    return new Promise<void>((resolve, reject) => {
      device.open(() => {
        printer
          .align('ct')
          .text('==============================')
          .text('      TEMPERO DE MAINHA       ')
          .text('==============================')
          .align('lt')
          .text(`PEDIDO #${pedido.numero_pedido}`)
          .text(`Cliente: ${pedido.nome_cliente}`)
          .text(`Contato: ${pedido.numero_cliente}`)
          .text(`Entrega: ${pedido.entrega}`)
          .text('------------------------------')
          .text(textoCupom)
          .text('------------------------------')
          .align('rt')
          .text(`TOTAL: R$ ${Number(pedido.valor_total).toFixed(2)}`)
          .align('lt')
          .text(`Método de Pagamento: ${pedido.metodo_pagamento}`)
          .text(`PAGO ?: ${pedido.pago}`)
          .text('==============================')
          .align('ct')
          .text('  OBRIGADO PELA PREFERÊNCIA!')
          .text('==============================')
          .cut()
          .close();

        resolve();
      });

      device.on('error', (err: any) => reject(err));
    });
  }

  private formatarCupom(pedido: any): string {
    let texto = '';

    // Garante que os items vieram como array
    const itens = Array.isArray(pedido.items)
      ? pedido.items
      : JSON.parse(pedido.items);

    itens.forEach((item: any, index: number) => {
      texto += `${index + 1}. ${item.name}  (x${item.quantity})\n`;
      texto += `   R$ ${item.price.toFixed(2)}\n`;

      if (item.garnishes && item.garnishes.length > 0) {
        texto += `   ➤ Acompanhamentos:\n`;
        item.garnishes.forEach((g: string) => {
          texto += `     - ${g}\n`;
        });
      }

      if (item.observations) {
        texto += `   Obs: ${item.observations}\n`;
      }

      texto += '------------------------------\n';
    });

    return texto;
  }
}

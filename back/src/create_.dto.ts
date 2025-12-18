export class CreateProdutoDto {
  nome: string;
  descricao?: string;
  preco: number;
  quantidade_em_estoque?: number;
  categoria?: string;
  ativo?: boolean;
  fornecedor?: string;
  codigo_barras: string;
}
export class CreateVendaDto {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  data_venda: string;
}

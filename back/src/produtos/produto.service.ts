import { Injectable } from '@nestjs/common';
import { PostgresService } from 'src/db/db.service';

@Injectable()
export class ProdutosService {
  constructor(private readonly postgresService: PostgresService) {}
  async findByCategoria(categoriaId: number) {
    const res = await this.postgresService.query(
      'SELECT * FROM produtos WHERE categoria_id=$1 ORDER BY id',
      [categoriaId],
    );

    return res.rows;
  }

  async create(data: any) {
    const { categoriaId, nome, preco, imagem, descricao, acompanhamentos } =
      data;
    const res = await this.postgresService.query(
      'INSERT INTO produtos (categoria_id, nome, preco, imagem, descricao, acompanhamentos) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [categoriaId, nome, preco, imagem, descricao, acompanhamentos],
    );
    return res.rows[0];
  }

  async update(id: number, data: any) {
    const { nome, preco, imagem, ativo, descricao, acompanhamentos } = data;
    const res = await this.postgresService.query(
      'UPDATE produtos SET nome=$1, preco=$2, imagem=$3, ativo=$4, descricao=$5, acompanhamentos=$6 WHERE id=$7 RETURNING *',
      [nome, preco, imagem, ativo, descricao, acompanhamentos, id],
    );
    return res.rows[0];
  }

  async delete(id: number) {
    await this.postgresService.query('DELETE FROM produtos WHERE id=$1', [id]);
    return { message: 'Produto excluído' };
  }
}

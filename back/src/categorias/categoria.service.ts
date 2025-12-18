import { PostgresService } from 'src/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriasService {
  constructor(private readonly postgresService: PostgresService) {}
  async findAll() {
    const res = await this.postgresService.query(
      'SELECT * FROM categorias ORDER BY id',
    );
    return res.rows;
  }

  async findOne(id: number) {
    const res = await this.postgresService.query(
      'SELECT * FROM categorias WHERE id=$1',
      [id],
    );
    return res.rows[0];
  }

  async create(data: any) {
    const { nome, descricao, imagem, preco } = data;
    const res = await this.postgresService.query(
      'INSERT INTO categorias (nome, descricao, imagem, preco) VALUES ($1,$2,$3, $4) RETURNING *',
      [nome, descricao, imagem, preco],
    );
    return res.rows[0];
  }

  async update(id: number, data: any) {
    const { nome, descricao, imagem, ativo, preco } = data;
    const res = await this.postgresService.query(
      'UPDATE categorias SET nome=$1, descricao=$2, imagem=$3, ativo=$4, preco=$5 WHERE id=$6 RETURNING *',
      [nome, descricao, imagem, ativo, preco, id],
    );
    return res.rows[0];
  }

  async delete(id: number) {
    await this.postgresService.query('DELETE FROM categorias WHERE id=$1', [
      id,
    ]);
    return { message: 'Categoria excluída' };
  }
}

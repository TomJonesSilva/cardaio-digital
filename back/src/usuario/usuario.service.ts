import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PostgresService } from 'src/db/db.service';

@Injectable()
export class UsuarioService {
  constructor(private readonly postgresService: PostgresService) {}

  // 🧠 Criar usuário com senha criptografada
  async criarUsuario(
    nome: string,
    cpf: string,
    telefone: string,
    senha: string,
    tipo_user: string,
  ) {
    const hash = await bcrypt.hash(senha, 10);

    const result = await this.postgresService.query(
      `INSERT INTO funcionarios (nome, cpf, telefone, senha, tipo_user)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, cpf, telefone, tipo_user`,
      [nome, cpf, telefone, hash, tipo_user],
    );

    return result.rows[0];
  }

  // 🔍 Listar todos
  async listarUsuarios() {
    const result = await this.postgresService.query(
      'SELECT id, nome, cpf, telefone,tipo_user FROM funcionarios ORDER BY id',
    );
    return result.rows;
  }

  // 🔍 Buscar por ID
  async buscarPorId(id: number) {
    const result = await this.postgresService.query(
      'SELECT id, nome, cpf, telefone FROM funcionarios WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0)
      throw new NotFoundException('Usuário não encontrado');
    return result.rows[0];
  }

  // ✏️ Atualizar (se senha for enviada, criptografa novamente)
  async atualizarUsuario(id: number, data: any) {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (data.nome) {
      fields.push(`nome = $${idx++}`);
      values.push(data.nome);
    }
    if (data.cpf) {
      fields.push(`cpf = $${idx++}`);
      values.push(data.cpf);
    }
    if (data.telefone) {
      fields.push(`telefone = $${idx++}`);
      values.push(data.telefone);
    }
    if (data.senha) {
      const hash = await bcrypt.hash(data.senha, 10);
      fields.push(`senha = $${idx++}`);
      values.push(hash);
    }
    if (data.tipo_user) {
      fields.push(`tipo_user = $${idx++}`);
      values.push(data.tipo_user);
    }

    if (fields.length === 0) {
      throw new NotFoundException('Nenhum campo enviado para atualização');
    }

    const query = `
      UPDATE funcionarios
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, nome, cpf, telefone, tipo_user
    `;

    const result = await this.postgresService.query(query, [...values, id]);
    if (result.rows.length === 0)
      throw new NotFoundException('Usuário não encontrado');
    return result.rows[0];
  }

  // ❌ Excluir
  async excluirUsuario(id: number) {
    const result = await this.postgresService.query(
      'DELETE FROM funcionarios WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0)
      throw new NotFoundException('Usuário não encontrado');
    return { message: 'Usuário excluído com sucesso' };
  }

  /*
  async login(cpf: string, senha: string) {
    // 🔎 Busca o funcionário pelo CPF
    const result = await this.postgresService.query(
      'SELECT * FROM funcionarios WHERE cpf = $1',
      [cpf],
    );

    // ❌ Se não encontrou, retorna false
    if (result.rows.length === 0) {
      return { tipo_user: 'cliente' };
    }

    const usuario = result.rows[0];

    // 🔐 Compara a senha enviada com o hash armazenado
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return { tipo_user: 'cliente' }; // senha errada
    }

    // ✅ Se a senha estiver correta, retorna o tipo de usuário
    return { tipo_user: usuario.tipo_user };
  }
    */
}

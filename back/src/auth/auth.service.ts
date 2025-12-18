import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PostgresService } from '../db/db.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly jwtService: JwtService,
  ) {}

  async login(cpf: string, senha: string) {
    // 🔎 Busca o funcionário
    const result = await this.postgresService.query(
      'SELECT * FROM funcionarios WHERE cpf = $1',
      [cpf],
    );

    // ❌ Se não achou, é cliente
    if (result.rows.length === 0) {
      return { tipo_user: 'cliente' };
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return { tipo_user: 'cliente' };
    }

    // ✅ Se for funcionário, gera o token
    const payload = {
      telefone: usuario.telefone,
      tipo_user: usuario.tipo_user,
      nome: usuario.nome,
    };

    const token = this.jwtService.sign(payload);

    return {
      tipo_user: usuario.tipo_user,
      token,
      nome: usuario.nome,
      telefone: usuario.telefone,
    };
  }
}

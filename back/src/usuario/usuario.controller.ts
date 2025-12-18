import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // 🧠 Criar novo usuário (senha criptografada)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async criarUsuario(
    @Body()
    body: {
      nome: string;
      cpf: string;
      telefone: string;
      senha: string;
      tipo_user: string;
    },
  ) {
    const { nome, cpf, telefone, senha, tipo_user } = body;
    if (!nome || !cpf || !telefone || !senha || !tipo_user) {
      throw new BadRequestException('Todos os campos são obrigatórios');
    }

    return this.usuarioService.criarUsuario(
      nome,
      cpf,
      telefone,
      senha,
      tipo_user,
    );
  }

  // 🔍 Buscar todos os usuários
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async listarUsuarios() {
    return this.usuarioService.listarUsuarios();
  }

  // 🔍 Buscar usuário por ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.usuarioService.buscarPorId(Number(id));
  }

  // ✏️ Atualizar usuário
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async atualizarUsuario(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      nome: string;
      cpf: string;
      telefone: string;
      senha: string;
      tipo_user: string;
    }>,
  ) {
    return this.usuarioService.atualizarUsuario(Number(id), body);
  }

  // ❌ Excluir usuário
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async excluirUsuario(@Param('id') id: string) {
    return this.usuarioService.excluirUsuario(Number(id));
  }
}

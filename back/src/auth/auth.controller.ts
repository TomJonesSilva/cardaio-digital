import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { nome: string; telefone: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { nome, telefone } = body;

    if (!nome || !telefone) {
      throw new BadRequestException('Nome e telefone são obrigatórios');
    }

    const loginResult = await this.authService.login(nome, telefone);

    // 🔹 Se for admin, atendente ou cozinha — envia o cookie JWT
    if (loginResult.tipo_user !== 'cliente') {
      res.cookie('jwt', loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // só HTTPS em prod
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //'strict', process.env.NODE_ENV === 'production' ? 'lax' : 'none', // 🔹 'none' permite localhost:3000 → localhost:3001
        path: '/', // 🔹 permite em toda a aplicação
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
      });
    }

    return {
      tipo_user: loginResult.tipo_user,
      nome: loginResult.nome,
      telefone: loginResult.telefone,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // 🔴 Novo endpoint de logout
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logout realizado com sucesso' };
  }
}

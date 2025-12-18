import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { ImpressaoService } from './impressao.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('imprimir')
export class ImpressaoController {
  constructor(private readonly imprimirPedido: ImpressaoService) {}
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin', 'cozinha') // 🔹 Somente admin ou cozinha podem acessar
  @Get(':numero_pedido')
  imprimir(@Param('numero_pedido') numero_pedido: string) {
    return this.imprimirPedido.imprimirPedido(Number(numero_pedido));
  }
}

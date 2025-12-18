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
import { PedidoService } from './pedido.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  create(@Body() body: any) {
    return this.pedidoService.createPedido(body);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin', 'cozinha') // 🔹 Somente admin ou cozinha podem acessar
  @Get()
  findAll() {
    return this.pedidoService.getPedidos();
  }

  @Get(':numero_pedido')
  findOne(@Param('numero_pedido') numero_pedido: string) {
    return this.pedidoService.getPedido(Number(numero_pedido));
  }

  @Get('cliente/:numero_cliente')
  async getPedidosByCliente(@Param('numero_cliente') numero_cliente: string) {
    return this.pedidoService.getPedidosByCliente(numero_cliente);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin', 'cozinha') // 🔹 Somente admin ou cozinha podem acessar
  @Patch(':numero_pedido')
  update(@Param('numero_pedido') numero_pedido: string, @Body() body: any) {
    return this.pedidoService.updatePedido(Number(numero_pedido), body);
  }

  @Delete(':numero_pedido')
  remove(@Param('numero_pedido') numero_pedido: string) {
    return this.pedidoService.deletePedido(Number(numero_pedido));
  }
}

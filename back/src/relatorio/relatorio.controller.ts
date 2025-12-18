import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';
import { ENHANCER_KEY_TO_SUBTYPE_MAP } from '@nestjs/common/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  // Resumo geral
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin')
  @Get('resumo')
  async getResumo(
    @Query('period') period: 'day' | 'week' | 'month' | 'all' = 'all',
  ) {
    return this.relatorioService.getResumo(period);
  }

  // Gráfico de pizza
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin')
  @Get('graficopizza')
  async getGraficoPizza(
    @Query('period') period: 'day' | 'week' | 'month' | 'all' = 'all',
  ) {
    return this.relatorioService.getGraficoPizza(period);
  }

  // Gráfico de linha
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin')
  @Get('graficolinha')
  async getGraficoLinha(
    @Query('period') period: 'day' | 'week' | 'month' | 'all' = 'all',
  ) {
    return this.relatorioService.getGraficoLinha(period);
  }
}

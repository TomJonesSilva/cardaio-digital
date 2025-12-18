import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriasService } from './categoria.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
    //return { categorias };
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoriasService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin') // 🔹 Somente admin ou cozinha podem acessar
  @Post()
  create(@Body() data: any) {
    return this.categoriasService.create(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin') // 🔹 Somente admin ou cozinha podem acessar
  @Patch(':id')
  update(@Param('id') id: number, @Body() data: any) {
    return this.categoriasService.update(id, data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) // 🔹 Aplica o JWT e o RolesGuard
  @Roles('admin') // 🔹 Somente admin ou cozinha podem acessar
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.categoriasService.delete(id);
  }
}

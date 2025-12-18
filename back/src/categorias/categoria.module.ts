import { Module } from '@nestjs/common';
import { CategoriasController } from './categoria.controller';
import { CategoriasService } from './categoria.service';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriaModule {}

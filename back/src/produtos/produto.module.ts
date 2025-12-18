import { Module } from '@nestjs/common';
import { ProdutosController } from './produto.controller';
import { ProdutosService } from './produto.service';

@Module({
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutoModule {}

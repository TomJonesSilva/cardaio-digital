import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PedidoModule } from './pedidos/pedido.module';
import { ImpressaoModule } from './impressao/impressao.module';
import { RelatorioModule } from './relatorio/relatorio.module';
import { CategoriaModule } from './categorias/categoria.module';
import { ProdutoModule } from './produtos/produto.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule, // ✅ Banco global
    AuthModule,
    UsuarioModule,
    PedidoModule,
    ImpressaoModule,
    RelatorioModule,
    CategoriaModule,
    ProdutoModule,
  ],
})
export class AppModule {}

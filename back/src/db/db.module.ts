import { Module, Global } from '@nestjs/common';
import { PostgresService } from './db.service';

@Global() // 🔥 Torna disponível em toda a aplicação, sem precisar importar em cada módulo
@Module({
  providers: [PostgresService],
  exports: [PostgresService],
})
export class DbModule {}

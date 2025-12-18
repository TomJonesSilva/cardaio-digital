import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit {
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST'),
      port: parseInt(this.configService.get<string>('DB_PORT') || '5432', 10),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
    });

    try {
      const client = await this.pool.connect();
      console.log('✅ Conectado ao PostgreSQL com sucesso!');
      client.release();
    } catch (err) {
      console.error('❌ Erro ao conectar ao PostgreSQL:', err);
    }
  }

  // 💡 Método para executar queries
  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Pool do PostgreSQL não está inicializado');
    }
    return this.pool.query(text, params);
  }

  // Se quiser, pode expor também o pool diretamente
  getPool(): Pool {
    return this.pool;
  }
}

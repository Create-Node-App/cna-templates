import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import path from 'path';
import * as schema from './schema';
import { getSecretValue } from '../helpers/asm';

@Injectable()
export class DrizzleProvider implements OnModuleInit {
  db: NodePgDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.db = drizzle(await this.getConnectionPool(), { schema });
    // IMPORTANT: After defining the database schema, run the command "npm run migrate"
    // then uncomment the following line!
    // this.migrateDb();
  }

  private async getConnectionPool() {
    return new Pool({
      connectionString: await this.getPostgresConnectionUrls(),
    });
  }

  private getMigrationsFolder() {
    const stage = this.configService.get<string>('STAGE');
    return stage === 'local' ? './src/db/migrations' : path.join(__dirname, 'migrations');
  }

  private migrateDb() {
    const migrationsFolder = this.getMigrationsFolder();
    migrate(this.db, { migrationsFolder });
  }

  private async getPostgresConfig() {
    let host = this.configService.get<string>('POSTGRES_HOST');
    let port = this.configService.get<string>('POSTGRES_PORT');
    let user = this.configService.get<string>('POSTGRES_USER');
    let password = this.configService.get<string>('POSTGRES_PASSWORD');
    let database = this.configService.get<string>('POSTGRES_DB');

    if (this.shouldUseSecretsManager()) {
      const secretName = this.configService.get<string>('POSTGRES_SECRET_NAME');
      const postgresSecret = (await getSecretValue(secretName)) as string;
      const postgresSecretJson = JSON.parse(postgresSecret) as Record<string, string>;
      host = host || postgresSecretJson.host;
      port = port || postgresSecretJson.port;
      user = user || postgresSecretJson.username;
      password = password || postgresSecretJson.password;
      database = database || postgresSecretJson.dbname;
    }

    return {
      host,
      port: parseInt(port || '', 10),
      user,
      password,
      database,
    };
  }

  private shouldUseSecretsManager() {
    const stage = this.configService.get<string>('STAGE');
    return !['local', 'offline'].includes(stage) && !!this.configService.get<string>('POSTGRES_SECRET_NAME');
  }

  private async getPostgresConnectionUrls() {
    const config = await this.getPostgresConfig();
    const { host, port, user, password, database } = config;
    return `postgres://${user}:${password}@${host}:${port}/${database}`;
  }
}

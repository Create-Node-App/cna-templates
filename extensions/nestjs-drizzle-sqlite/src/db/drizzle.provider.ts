// @ts-expect-error -- ESM package; TypeScript 6 node16 CJS cannot resolve, works at runtime
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Injectable, OnModuleInit } from '@nestjs/common';
// @ts-expect-error -- ESM package; TypeScript 6 node16 CJS cannot resolve, works at runtime
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
// @ts-expect-error -- ESM package; TypeScript 6 node16 CJS cannot resolve, works at runtime
import Database from 'better-sqlite3';
import { ConfigService } from '@nestjs/config';
import path from 'path';

@Injectable()
export class DrizzleProvider implements OnModuleInit {
  private database!: Database.Database;
  private _db: BetterSQLite3Database | undefined;

  constructor(private readonly configService: ConfigService) {}

  get db(): BetterSQLite3Database {
    if (!this._db) {
      throw new Error('DrizzleProvider has not been initialized. Wait for onModuleInit() to complete.');
    }
    return this._db;
  }

  async onModuleInit() {
    this.database = this.createDb();
    this._db = drizzle(this.database);
    // IMPORTANT: After defining the database schema, run the command "npm run migrate"
    // then uncomment the following line!
    // this.migrateDb();
  }

  private createDb() {
    const sqliteDbName = this.configService.get<string>('SQLITE_DATABASE_NAME')! || 'database';
    const sqliteDbPath = `${sqliteDbName}.db`;
    return new Database(sqliteDbPath);
  }

  private getMigrationsFolder() {
    const stage = this.configService.get<string>('STAGE')!;
    return stage === 'local' ? './src/db/migrations' : path.join(__dirname, 'migrations');
  }

  private migrateDb() {
    const migrationsFolder = this.getMigrationsFolder();
    migrate(this.db, { migrationsFolder });
  }
}

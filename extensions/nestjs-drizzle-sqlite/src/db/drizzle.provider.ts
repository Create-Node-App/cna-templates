import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { ConfigService } from '@nestjs/config';
import path from 'path';

@Injectable()
export class DrizzleProvider implements OnModuleInit {
  db: BetterSQLite3Database;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.db = drizzle(this.createDb());
    // IMPORTANT: After defining the database schema, run the command "npm run migrate"
    // then uncomment the following line!
    // this.migrateDb();
  }

  private createDb() {
    const sqlite_db_name = this.configService.get<string>('SQLITE_DATABASE_NAME') + '.db';
    return new Database(sqlite_db_name);
  }

  private getMigrationsFolder() {
    const stage = this.configService.get<string>('STAGE');
    return stage === 'local' ? './src/db/migrations' : path.join(__dirname, 'migrations');
  }

  private migrateDb() {
    const migrationsFolder = this.getMigrationsFolder();
    migrate(this.db, { migrationsFolder: migrationsFolder });
  }
}

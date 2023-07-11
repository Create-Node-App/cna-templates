import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { Injectable, OnModuleInit } from '@nestjs/common';

import Database from 'better-sqlite3';

@Injectable()
export class DrizzleProvider implements OnModuleInit {
  db: BetterSQLite3Database;

  async onModuleInit() {
    const sqlite = new Database('sqlite.db');
    this.db = drizzle(sqlite);
  }
}

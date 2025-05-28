import sqlite3 from 'sqlite3';
import path from 'path';
import { TableCreationError } from '../errors/server.error';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: sqlite3.Database;

  private constructor() {
    const dbPath = path.resolve(__dirname, 'pawntopawn.db');
    const sqlite3Verbose = sqlite3.verbose();
    this.db = new sqlite3Verbose.Database(
      dbPath,
      sqlite3.OPEN_READWRITE,
      this.handleConnection.bind(this)
    );
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private handleConnection(err: Error | null): void {
    if (err) {
      console.error('Could not connect to the database:', err.message);
      process.exit(1);
    }
    console.log('Successfully connected to the database');
  }

  public getDatabase(): sqlite3.Database {
    return this.db;
  }

  public async initializeTables(): Promise<void> {
    const tables = [
      {
        name: 'materials',
        sql: `
          CREATE TABLE IF NOT EXISTS materials (
            id UUID PRIMARY KEY,
            type TEXT NOT NULL,
            weight INTEGER NOT NULL,
            price INTEGER NOT NULL
          )
        `
      },
      {
        name: 'machines',
        sql: `
          CREATE TABLE IF NOT EXISTS machines (
            id UUID PRIMARY KEY,
            max_widht INTEGER NOT NULL,
            max_weight INTEGER NOT NULL,
            max_velocity INTEGER NOT NULL,
            price INTEGER NOT NULL
          )
        `
      },
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            id_number TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone INTEGER UNIQUE,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'products',
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY,
            id_machine UUID NOT NULL,
            id_material UUID NOT NULL,
            base TEXT NOT NULL,
            cover TEXT NOT NULL,
            length REAL NOT NULL,
            estimated_time TIMESTAMP,
            estimated_weight REAL,
            widht REAL,
            price REAL,
            FOREIGN KEY (id_machine) REFERENCES machines(id) ON DELETE CASCADE,
            FOREIGN KEY (id_material) REFERENCES materials(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'orders',
        sql: `
          CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY,
            id_client UUID NOT NULL,
            id_product UUID NOT NULL,
            id_operator UUID,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processing_at TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (id_client) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (id_operator) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (id_product) REFERENCES products(id) ON DELETE CASCADE
          )
        `
      },
      {
        name: 'user_refresh_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS user_refresh_tokens (
            id UUID PRIMARY KEY,
            id_user UUID NOT NULL,
            token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            revoked BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            device_info TEXT,
            FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
          )
        `
      }
    ];

    for (const table of tables) {
      await this.createTable(table.name, table.sql);
    }
  }

  private createTable(tableName: string, sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          reject(new TableCreationError(`Could not create table ${tableName}: ${err.message}`));
        }
        resolve();
      });
    });
  }

  public async query<T>(sql: string, params: any[] = []): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row as T);
      });
    });
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        resolve();
      });
    });
  }
} 
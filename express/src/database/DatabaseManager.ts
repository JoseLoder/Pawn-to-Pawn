import { Pool, QueryResult, QueryResultRow } from 'pg';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL, // Your Supabase connection string
      ssl: {
        rejectUnauthorized: false // Required for Supabase connections
      }
    });

    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      process.exit(1);
    });

    console.log('Successfully connected to the database pool');
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async query<T extends QueryResultRow>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<T> = await client.query<T>(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(sql, params);
    } finally {
      client.release();
    }
  }
} 
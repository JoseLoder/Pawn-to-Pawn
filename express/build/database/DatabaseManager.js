"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const pg_1 = require("pg");
class DatabaseManager {
    static instance;
    pool;
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL, // Your Supabase connection string
            ssl: {
                rejectUnauthorized: false // Required for Supabase connections
            }
        });
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(1);
        });
        console.log('Successfully connected to the database pool');
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async query(sql, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    async run(sql, params = []) {
        const client = await this.pool.connect();
        try {
            await client.query(sql, params);
        }
        finally {
            client.release();
        }
    }
}
exports.DatabaseManager = DatabaseManager;

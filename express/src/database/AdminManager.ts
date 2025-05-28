import { QueryError } from "../errors/server.error";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { DatabaseManager } from "./DatabaseManager";

export class AdminManager {
  private static instance: AdminManager;
  private db: DatabaseManager;

  // Admin configuration
  private readonly adminConfig = {
    ID_NUMBER: process.env.ADMIN_ID_NUMBER || '00000000',
    NAME: process.env.ADMIN_NAME || 'Admin',
    EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'admin1234',
    ROLE: 'admin'
  };

  private constructor() {
    this.db = DatabaseManager.getInstance();
  }

  public static getInstance(): AdminManager {
    if (!AdminManager.instance) {
      AdminManager.instance = new AdminManager();
    }
    return AdminManager.instance;
  }

  public async checkAdminExists(): Promise<boolean> {
    try {
      const row = await this.db.query(
        'SELECT 1 FROM users WHERE email = ? OR role = ? LIMIT 1',
        [this.adminConfig.EMAIL, this.adminConfig.ROLE]
      );
      return !!row;
    } catch (err) {
      throw new QueryError('Could not verify admin existence');
    }
  }

  private async createAdmin(): Promise<void> {
    const adminId = crypto.randomUUID();
    const adminPassword = await bcrypt.hash(this.adminConfig.DEFAULT_PASSWORD, 12);

    try {
      await this.db.run(
        `INSERT INTO users (id, id_number, name, phone, email, password, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminId,
          this.adminConfig.ID_NUMBER,
          this.adminConfig.NAME,
          null,
          this.adminConfig.EMAIL,
          adminPassword,
          this.adminConfig.ROLE
        ]
      );

      console.warn(`Admin user created with temporary password. CHANGE THIS PASSWORD IMMEDIATELY.`);
      console.warn(`Temporary password: ${this.adminConfig.DEFAULT_PASSWORD}`);
    } catch (err) {
      console.error('Error creating admin user:', err);
      throw new QueryError('Could not create admin user');
    }
  }

  public async initializeAdmin(): Promise<void> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Initializing admin user check...');
      }

      const adminExists = await this.checkAdminExists();
      if (!adminExists) {
        await this.createAdmin();
      } else {
        console.info('Admin user already exists, skipping creation');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Critical: Failed to initialize admin user', error);
        process.exit(1);
      }
      console.error('Non-critical error initializing admin user', error);
      throw error;
    }
  }
} 
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminManager = void 0;
const server_error_1 = require("../errors/server.error");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const DatabaseManager_1 = require("./DatabaseManager");
class AdminManager {
    static instance;
    db;
    // Admin configuration
    adminConfig = {
        ID_NUMBER: process.env.ADMIN_ID_NUMBER || '00000000',
        NAME: process.env.ADMIN_NAME || 'Admin',
        EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
        DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'admin1234',
        ROLE: 'admin'
    };
    constructor() {
        this.db = DatabaseManager_1.DatabaseManager.getInstance();
    }
    static getInstance() {
        if (!AdminManager.instance) {
            AdminManager.instance = new AdminManager();
        }
        return AdminManager.instance;
    }
    async checkAdminExists() {
        try {
            const rows = await this.db.query('SELECT 1 FROM users WHERE email = $1 OR role = $2 LIMIT 1', [this.adminConfig.EMAIL, this.adminConfig.ROLE]);
            return rows.length > 0;
        }
        catch (err) {
            throw new server_error_1.QueryError('Could not verify admin existence');
        }
    }
    async createAdmin() {
        const adminId = crypto_1.default.randomUUID();
        const adminPassword = await bcrypt_1.default.hash(this.adminConfig.DEFAULT_PASSWORD, 12);
        try {
            await this.db.run(`INSERT INTO users (id, id_number, name, phone, email, password, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                adminId,
                this.adminConfig.ID_NUMBER,
                this.adminConfig.NAME,
                null,
                this.adminConfig.EMAIL,
                adminPassword,
                this.adminConfig.ROLE
            ]);
            console.warn(`Admin user created with temporary password. CHANGE THIS PASSWORD IMMEDIATELY.`);
            console.warn(`Temporary password: ${this.adminConfig.DEFAULT_PASSWORD}`);
        }
        catch (err) {
            console.error('Error creating admin user:', err);
            throw new server_error_1.QueryError('Could not create admin user');
        }
    }
    async initializeAdmin() {
        try {
            if (process.env.NODE_ENV !== 'production') {
                console.info('Initializing admin user check...');
            }
            const adminExists = await this.checkAdminExists();
            if (!adminExists) {
                await this.createAdmin();
            }
            else {
                console.info('Admin user already exists, skipping creation');
            }
        }
        catch (error) {
            if (process.env.NODE_ENV === 'production') {
                console.error('Critical: Failed to initialize admin user', error);
                process.exit(1);
            }
            console.error('Non-critical error initializing admin user', error);
            throw error;
        }
    }
}
exports.AdminManager = AdminManager;

import { QueryError } from "../errors/server.error";
import { DB } from "./connect";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Configuración segura del admin (debería venir de variables de entorno)
const ADMIN_CONFIG = {
    ID_NUMBER: process.env.ADMIN_ID_NUMBER || '00000000',
    NAME: process.env.ADMIN_NAME || 'Admin',
    EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || crypto.randomBytes(16).toString('hex'),
    ROLE: 'admin'
};

/**
 * Verifica si el usuario admin ya existe en la base de datos
 */
export async function checkAdminExists(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        DB.get(
            'SELECT 1 FROM users WHERE email = ? OR role = ? LIMIT 1',
            [ADMIN_CONFIG.EMAIL, ADMIN_CONFIG.ROLE],
            (err, row) => {
                if (err) {
                    /*           logger.error('Error checking admin existence', err); */
                    return reject(new QueryError('Could not verify admin existence'));
                }
                resolve(!!row);
            }
        );
    });
}

/**
 * Crea el usuario admin solo si no existe
 */
export async function createAdminIfNotExists(): Promise<void> {
    try {
        const adminExists = await checkAdminExists();

        if (adminExists) {
/*       logger.info('Admin user already exists, skipping creation');
 */      return;
        }

        const adminId = crypto.randomUUID();
        const adminPassword = await bcrypt.hash(ADMIN_CONFIG.DEFAULT_PASSWORD, 12); // Usamos versión asíncrona

        await new Promise<void>((resolve, reject) => {
            DB.run(
                `INSERT INTO users (id, id_number, name, phone, email, password, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    adminId,
                    ADMIN_CONFIG.ID_NUMBER,
                    ADMIN_CONFIG.NAME,
                    null,
                    ADMIN_CONFIG.EMAIL,
                    adminPassword,
                    ADMIN_CONFIG.ROLE
                ],
                function (err) {
                    if (err) {
                        /*             logger.error('Error creating admin user', err);
                         */
                        console.log('Error creating admin user', err)
                        return reject(new QueryError('Could not create admin user'));
                    }
/*           logger.warn(`Admin user created with temporary password. CHANGE THIS PASSWORD IMMEDIATELY.`);
          logger.warn(`Temporary password: ${ADMIN_CONFIG.DEFAULT_PASSWORD}`);
 */          resolve();
                }
            );
        });
    } catch (error) {
/*     logger.error('Failed to initialize admin user', error);
 */console.log('Failed to initialize admin user', error)
        throw error;
    }
}

/**
 * Función para inicializar el admin al arrancar el servidor
 */
export async function initializeAdminUser() {
    if (process.env.NODE_ENV !== 'production') {
/*     logger.info('Initializing admin user check...');
 */console.log('Initializing admin user check...')
    }

    try {
        await createAdminIfNotExists();
    } catch (error) {
        // En producción, podrías querer detener el servidor si no puede crear/verificar el admin
        if (process.env.NODE_ENV === 'production') {
            /*       logger.fatal('Critical: Failed to initialize admin user', error);
             */
            console.log('Critical: Failed to initialize admin user', error)
            process.exit(1); // Salir con error
        }
/*     logger.error('Non-critical error initializing admin user', error);
 */console.log('Non-critical error initializing admin user', error)
    }
}
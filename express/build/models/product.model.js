"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const connect_1 = require("../database/connect");
const server_error_1 = require("../errors/server.error");
exports.ProductModel = {
    async getAll() {
        const sql = `SELECT * FROM products`;
        try {
            const result = await connect_1.DB.query(sql);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not get all products');
        }
    },
    async getById(id) {
        const sql = `SELECT * FROM products WHERE id = $1`;
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rows.length === 0) {
                throw new server_error_1.QueryError(`Product not found with id: ${id}`);
            }
            return result.rows[0];
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get product by this id ${id}`);
        }
    },
    async getByMaterial(id_material) {
        const sql = `SELECT * FROM products WHERE id_material = $1`;
        try {
            const result = await connect_1.DB.query(sql, [id_material]);
            return result.rows;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not get products by material id ${id_material}`);
        }
    },
    async create(product) {
        const sql = `
            INSERT INTO products (
                id, 
                id_machine, 
                id_material, 
                base, 
                cover, 
                length,
                estimated_time,
                estimated_weight,
                widht,
                price
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        try {
            await connect_1.DB.query(sql, [
                product.id,
                product.id_machine,
                product.id_material,
                product.base,
                product.cover,
                product.length,
                product.estimated_time,
                product.estimated_weight,
                product.widht,
                product.price
            ]);
            return product.id;
        }
        catch (error) {
            throw new server_error_1.QueryError('Could not insert new product');
        }
    },
    async update(id, product) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (product.id_machine !== undefined) {
            updates.push(`id_machine = $${paramCount}`);
            values.push(product.id_machine);
            paramCount++;
        }
        if (product.id_material !== undefined) {
            updates.push(`id_material = $${paramCount}`);
            values.push(product.id_material);
            paramCount++;
        }
        if (product.base !== undefined) {
            updates.push(`base = $${paramCount}`);
            values.push(product.base);
            paramCount++;
        }
        if (product.cover !== undefined) {
            updates.push(`cover = $${paramCount}`);
            values.push(product.cover);
            paramCount++;
        }
        if (product.length !== undefined) {
            updates.push(`length = $${paramCount}`);
            values.push(product.length);
            paramCount++;
        }
        if (product.estimated_time !== undefined) {
            updates.push(`estimated_time = $${paramCount}`);
            values.push(product.estimated_time);
            paramCount++;
        }
        if (product.estimated_weight !== undefined) {
            updates.push(`estimated_weight = $${paramCount}`);
            values.push(product.estimated_weight);
            paramCount++;
        }
        if (product.widht !== undefined) {
            updates.push(`widht = $${paramCount}`);
            values.push(product.widht);
            paramCount++;
        }
        if (product.price !== undefined) {
            updates.push(`price = $${paramCount}`);
            values.push(product.price);
            paramCount++;
        }
        if (updates.length === 0) {
            throw new server_error_1.QueryError('No fields to update');
        }
        values.push(id);
        const sql = `
            UPDATE products 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
        `;
        try {
            const result = await connect_1.DB.query(sql, values);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Product not found with id: ${id}`);
            }
            return id;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not update product by this id: ${id}`);
        }
    },
    async delete(id) {
        const sql = 'DELETE FROM products WHERE id = $1';
        try {
            const result = await connect_1.DB.query(sql, [id]);
            if (result.rowCount === 0) {
                throw new server_error_1.QueryError(`Product not found with id: ${id}`);
            }
            return true;
        }
        catch (error) {
            throw new server_error_1.QueryError(`Could not delete product by this id: ${id}`);
        }
    }
};

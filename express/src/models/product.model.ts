import { DB } from "../database/connect";
import { QueryError } from "../errors/server.error";
import { CreateProduct, Product } from "../types/products.types";

export const ProductModel = {
    async getAll(): Promise<Product[]> {
        const sql = `SELECT * FROM products`
        const data: { product: Product[] } = { product: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {

            DB.all(sql, [], (err, rows) => {
                if (err) return reject(new QueryError('Could not get all products'));

                (rows as Product[]).forEach((row: Product) => {
                    data.product.push({
                        ...row
                    })
                })
                resolve(data.product)
            })
        })
    },

    async getByMaterial(id_material: string): Promise<Product[]> {
        const sql = `SELECT * FROM products WHERE id_material = ?`
        const data: { product: Product[] } = { product: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.all(sql, id_material, (err, rows) => {
                if (err) {
                    return reject(new QueryError(`Could not get products by machine id ${id_material}`))
                }

                ; (rows as Product[]).forEach((row: Product) => {
                    data.product.push({
                        ...row
                    })
                })
            })
            resolve(data.product)
        })
    },

    async createProduct(id: string, product: CreateProduct): Promise<string> {
        const sql = `INSERT INTO products (id, id_machine, id_base, id_cover, id_material) VALUES( ?,?,?,?,?)`

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.run(sql, [id, product.id_machine, product.id_base, product.id_cover, product.id_material], (err) => {
                if (err) reject(new QueryError('Could not instert new product'))

                resolve(id)
            })
        })
    }
}
import { Request, Response } from "express";
import { handleError } from "../errors/handleError";
import { ProductModel } from "../models/product.model";
import { ClientError } from "../errors/client.error";
import { CreateProduct } from "../types/products.types";

export const ProductsController = {

    async getAll(_: Request, res: Response): Promise<void> {
        try {
            const products = await ProductModel.getAll()
            if (!products) {
                throw new ClientError('Products does not exists')
            }
            res.status(200).json({ success: true, products })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            if (!id) throw new ClientError('The id must be correct')

            const product = await ProductModel.getById(id)
            if (!product) throw new ClientError(`The product by this id ${id} not exists`)
            res.status(200).json({ success: true, product })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async getByMaterial(req: Request, res: Response): Promise<void> {
        try {
            const { id_material } = req.params
            if (!id_material) throw new ClientError('The id_material must be correct')
            const products = await ProductModel.getByMaterial(id_material)
            if (!products) throw new ClientError('Products does not exists')
            res.status(200).json({ success: true, products })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async create(req: Request, res: Response): Promise<void> {
        const { base, cover, id_machine, id_material, lenght, widht } = req.body as CreateProduct
        // validate all by Zod

        //serch id_material to get: weight
        // get (weight(g) * lenght (meters)) = estimated_weight
        // Example: 500g * 40m = 20000g

        //search id_machine to get: Max_widht,Max_velocity,Max_weight
        // check weight < Max_weight
        // check widht < Max_widht
        // get (weight / Max_velocity(g/h)) = estimated_time
        // Example: 20000g / 100000g = 0.2 hour(per product)

    }
}
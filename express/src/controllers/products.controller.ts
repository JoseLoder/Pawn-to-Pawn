import { Request, Response } from "express";
import { handleError } from "../errors/handleError";
import { ProductModel } from "../models/product.model";
import { ClientError } from "../errors/client.error";
import { CreateProduct, Product, ProductReturn } from '@pawn-to-pawn/shared';
import { validateProduct } from "../schema/products.schema";
import { ZodError } from "zod";
import { MaterialModel } from "../models/material.model";
import { MachineModel } from "../models/machine.model";
import { ServerError } from "../errors/server.error";
import { calculateProduct } from "../services/product.calculations";

export const ProductsController = {

    async getAll(_: Request, res: Response): Promise<void> {
        try {
            const products = await ProductModel.getAll()
            if (!products) {
                throw new ClientError('Products does not exists')
            }

            const productsReturn = await ProductsController.productsReturn(products)
            res.status(200).json(productsReturn)
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

            const productReturn = await ProductsController.productReturn(product)
            res.status(200).json(productReturn)
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

            const productsReturn = await ProductsController.productsReturn(products)
            res.status(200).json(productsReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async create(req: Request, res: Response): Promise<void> {
        const { base, cover, id_machine, id_material, length, widht } = req.body as CreateProduct
        try {
            // validate all by Zod
            const validated = await validateProduct({ id_machine, id_material, base, cover, length, widht })
            if (!validated.success || !validated.data) {
                if (validated.error instanceof ZodError) {
                    throw validated.error
                }
                throw new ClientError('Validation failed')
            }
            //search by id_material to get: material.weight
            const material = await MaterialModel.getById(id_material)
            if (!material) {
                throw new ClientError('This material not exists')
            }

            //search by id_machine to get: Max_widht,Max_velocity,Max_weight
            const machine = await MachineModel.getById(id_machine)
            if (!machine) {
                throw new ClientError('This machine not exists')
            }

            const result = calculateProduct({
                material,
                machine,
                length,
                widht
            })
            const product: Product = {
                id: crypto.randomUUID(),
                id_machine,
                id_material,
                base,
                cover,
                widht,
                length,
                estimated_time: result.estimated_time,
                estimated_weight: result.estimated_weight,
                price: result.price
            }

            const productId = await ProductModel.create(product)
            if (!productId) {
                throw new ServerError('Finally could not been created product')
            }
            
            const createdProduct = await ProductModel.getById(productId)
            if (!createdProduct) {
                throw new ServerError('The product was not found after creation.')
            }

            const productReturn = await ProductsController.productReturn(createdProduct)
            res.status(200).json(productReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },


    // SERVICES FUNCTION 

    productReturn: async (product: Product): Promise<ProductReturn> => {
        const material = await MaterialModel.getById(product.id_material)
        if (!material) throw new ClientError('The material not exists')

        const productReturn = {
            ...product,
            product_name: material.type
        } as ProductReturn

        return productReturn;
    },

    productsReturn: async (products: Product[]): Promise<ProductReturn[]> => {

        return await Promise.all(
            products.map(async (product) => {
                return await ProductsController.productReturn(product)
            })
        )

    }
}
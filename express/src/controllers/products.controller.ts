import { Request, Response } from "express";
import { handleError } from "../errors/handleError";
import { ProductModel } from "../models/product.model";
import { ClientError } from "../errors/client.error";
import { CreateProduct, Product } from "../types/products.types";
import { validateProduct } from "../schema/products.schema";
import { ZodError } from "zod";
import { MaterialModel } from "../models/material.model";
import { MachineModel } from "../models/machine.model";
import { ServerError } from "../errors/server.error";

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
        try {
            // validate all by Zod
            const validated = await validateProduct({ id_machine, id_material, base, cover, lenght, widht })
            if (!validated.success || !validated.data) {
                if (validated.error instanceof ZodError) {
                    throw validated.error
                }
                throw new ClientError('Validation failed')
            }
            //serch id_material to get: weight
            const material = await MaterialModel.getById(id_material)
            if (!material) {
                throw new ClientError('This material not exists')
            }
            // get lenght(meters) * Material.weight(g) = estimated_weight(g)
            // Example: 40m * 500g = 20000g
            const estimated_weight = material.weight * lenght

            //search id_machine to get: Max_widht,Max_velocity,Max_weight
            const machine = await MachineModel.getById(id_machine)
            if (!machine) {
                throw new ClientError('This machine not exists')
            }

            // check weight(g) < Machine.Max_weight(g)
            if (estimated_weight > machine.max_weight) {
                throw new ClientError(`
                    This machine is too small for that product, 
                    choose another machine that supports MORE WEIGHT,
                    OR REDUCE THE LENGTH of the product.
                `)
            }
            // check widht(mm) < Machine.Max_widht(mm)
            if (widht > machine.max_widht)
                throw new ClientError(`
                        This machine is too narrow for that product, 
                        choose another WIDER MACHINE, 
                        OR REDUCE THE WIDTH of the product.
                `)
            // get (weight(g) / Machine.Max_velocity(g/minutes)) = estimated_time(minutes)
            // Example: 20000g / 1000g = 20 minutes(per product)
            const estimated_time = estimated_weight / machine.max_velocity

            // Calculate price Material, lenght(meters) * Material.Price(euros). (Calculated by the transportation of the material, its cost, handling and benefits)
            // Example: 40(m) * 1.5(euros) = 60(euros)
            const priceMaterial = lenght * material.price

            // Calculate price machine, estimated_time(minutes) * Machine.Price(euros). (Calculated by the maintenance of the machine and the personnel working on it and benefits)
            // Example: 20(minutes) * 1.5 = 30(euros)
            const priceMachine = estimated_time * machine.price

            // Total Price, priceMaterial + PriceMachine
            // Example:  60(euros) + 30(euros) = 90 euros(per product)
            const price = priceMaterial + priceMachine

            const product: Product = {
                id: crypto.randomUUID(),
                id_machine,
                id_material,
                base,
                cover,
                widht,
                lenght,
                estimated_time,
                estimated_weight,
                price
            }

            const productId = await ProductModel.create(product)
            if (!productId) {
                throw new ServerError('Finally could not been created product')
            }
            const createdProduct = await ProductModel.getById(productId)
            if (!createdProduct) {
                throw new ServerError('The product was not found after creation.')
            }

            res.status(201).json({ success: true, createdProduct })
        } catch (e) {
            handleError(e as Error, res)
        }
    }
}
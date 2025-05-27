import { Request, Response } from "express"
import { ClientError } from "../errors/client.error"
import { MaterialModel } from "../models/material.model"
import { handleError } from "../errors/handleError"
import { CreateMaterial } from "../types/materials.types"
import { validateMaterial } from "../schema/material.schema"
import { ZodError } from "zod"
import { ServerError } from "../errors/server.error"

export const MaterialsController = {
    async getById(req: Request, res: Response) {

        try {

            const { id } = req.params
            if (!id) throw new ClientError('The id must be correct')
            const materials = await MaterialModel.getById(id)
            if (!materials) throw new ClientError('This material already not exists')

            res.status(200).json(materials)

        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getAll(_: Request, res: Response) {
        try {
            const materials = await MaterialModel.getAll()
            if (!materials) throw new ClientError('There are no orders right now.')
            res.status(200).json(materials)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async create(req: Request, res: Response) {
        try {
            const { price, type, weight } = req.body as CreateMaterial;
            const validated = await validateMaterial({ price, type, weight })
            if (!validated.success || !validated.data) {
                if (validated.error instanceof ZodError) {
                    throw validated.error
                }
                throw new ClientError('Validation failed')
            }

            const id = crypto.randomUUID()
            const materialId = await MaterialModel.create(id as string, { price, type, weight })
            if (!materialId) throw new ServerError('Finally could not been created material')
            const createdMaterial = await MaterialModel.getById(materialId)
            if (!createdMaterial) throw new ServerError('The material was not found after creation.')

            res.status(201).json(createdMaterial)
        } catch (e) {
            handleError(e as Error, res)
        }
    }
}

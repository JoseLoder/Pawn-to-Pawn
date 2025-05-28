import { Request, Response } from "express"
import { ClientError } from "../errors/client.error"
import { handleError } from "../errors/handleError"
import { MachineModel } from "../models/machine.model"
import { CreateMachine } from '@pawn-to-pawn/shared'
import { validateMachine } from "../schema/machine.schema"
import { ZodError } from "zod"
import { ServerError } from "../errors/server.error"

export const MachinesController = {
    async getById(req: Request, res: Response) {

        try {

            const { id } = req.params
            if (!id) throw new ClientError('The id must be correct')
            const order = await MachineModel.getById(id)
            if (!order) throw new ClientError('This machine already not exists')

            res.status(200).json(order)

        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getAll(_: Request, res: Response) {
        try {
            const orders = await MachineModel.getAll()
            if (!orders) throw new ClientError('There are no orders right now.')
            res.status(200).json(orders)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async create(req: Request, res: Response) {
        try {
            const { max_velocity, max_weight, max_widht, price } = req.body as CreateMachine;
            const validated = await validateMachine({ price, max_velocity, max_weight, max_widht })
            if (!validated.success || !validated.data) {
                if (validated.error instanceof ZodError) {
                    throw validated.error
                }
                throw new ClientError('Validation failed')
            }

            const id = crypto.randomUUID()
            const machineId = await MachineModel.create(id as string, { max_velocity, max_weight, max_widht, price })
            if (!machineId) throw new ServerError('Finally could not been created machine')
            const createdMachine = await MachineModel.getById(machineId)
            if (!createdMachine) throw new ServerError('The machine was not found after creation.')

            res.status(201).json(createdMachine)
        } catch (e) {
            handleError(e as Error, res)
        }
    }
}
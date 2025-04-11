import { Request, Response } from "express";
import { ClientError, UnauthorizedError } from "../errors/client.error";
import { handleError } from "../errors/handleError";
import { OrderModel } from "../models/order.model";
import { CreateOrder, Order } from "../types/orders.type";
import { UserModel } from "../models/user.model";
import { validateOrder } from "../schema/orders.schema";
import { ZodError } from "zod";
import { ProductModel } from "../models/product.model";

export const OrdersController = {

    // To admin actions
    async getById(req: Request, res: Response) {

        try {

            const { id } = req.params
            if (!id) throw new ClientError('The id must be correct')
            const order = await OrderModel.getById(id)
            if (!order) throw new ClientError('This order already not exists')

            res.status(200).json({ success: true, order })

        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getAll(_: Request, res: Response) {
        try {
            const orders = await OrderModel.getAll()
            if (!orders) throw new ClientError('There are no orders right now.')
            res.status(200).json({ success: true, orders })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    // To operator actions and admin too
    async getPending(_: Request, res: Response) {

        try {
            const pending = await OrderModel.getByOperator(null)
            if (!pending) throw new ClientError('There are no pending orders right now.')
            res.status(200).json({ success: true, pending })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async setOperator(req: Request, res: Response) {

        try {
            const { id_operator, id_order } = req.params
            if (!id_operator || !id_order) throw new ClientError('the id must be correct')

            const operator = await UserModel.getById(id_operator)
            const order = await OrderModel.getById(id_order)
            if (!operator || !order) throw new ClientError('This Operator or Order not exists')
            if (order.id_operator) throw new ClientError('This order already has an operator assigned')
            if (operator.role != 'operator') throw new UnauthorizedError('This User no be Operator User')
            const updated: Order = {
                ...order,
                id_operator: id_operator,
                status: 'inProgress'
            }

            const idUpdated = await OrderModel.update(id_order, updated)
            const orderUpdated = await OrderModel.getById(idUpdated)
            res.status(200).json({ success: true, orderUpdated })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async setCompleted(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) throw new ClientError('The order id must be correct')
            const order = await OrderModel.getById(id)
            if (!order) throw new ClientError('This order not exists')
            if (order.status != 'inHold') throw new ClientError('The order must be inHold before to be completed')
            const updated: Order = {
                ...order,
                status: 'done'
            }
            const idUpdated = await OrderModel.update(id, updated)
            const orderUpdated = await OrderModel.getById(idUpdated)
            res.status(200).json({ success: true, orderUpdated })
        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getByOperator(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) throw new ClientError('The operator id must be correct')
            const operator = await UserModel.getById(id)
            if (!operator) throw new ClientError('The operator not exists')
            if (operator.role != 'operator') throw new ClientError('This user must be Operator User')
            const orders = await OrderModel.getByOperator(operator.id)
            if (!orders) throw new ClientError('Not exists order by this operator')
            res.status(200).json({ success: true, orders })
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    // To client actions and admin too
    async create(req: Request, res: Response) {
        try {
            const { id_client, id_product, quantity } = req.body as CreateOrder
            const validated = await validateOrder({ id_client, id_product, quantity })
            if (!validated.success || !validated.data) {
                if (validated.error instanceof ZodError) {
                    throw validated.error
                }
                throw new ClientError('Validation failed')
            }
            //Get product
            const product = await ProductModel.getById(id_product)
            if (!product) throw new ClientError('The product not exists')
            //Calculate price
            const price = quantity * product.price


            const createdId = await OrderModel.create()
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async getByClient(req: Request, res: Response) { }
}
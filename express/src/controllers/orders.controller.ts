import { Request, Response } from "express";
import { ClientError, UnauthorizedError } from "../errors/client.error";
import { handleError } from "../errors/handleError";
import { OrderModel } from "../models/order.model";
import { Order, OrderReturn, PublicCreateOrder } from "../types/orders.type";
import { UserModel } from "../models/user.model";
import { validateOrder } from "../schema/orders.schema";
import { ProductModel } from "../models/product.model";
import { ServerError } from "../errors/server.error";
import { ZodError } from "zod";
import { AccessTokenEncryption } from "../types/tokens.types";
import { PreparationOrder } from "../types/products.types";
import { MaterialModel } from "../models/material.model";
import { User } from "../types/users.types";
declare global {
    namespace Express {
        interface Request {
            session?: { userSession: AccessTokenEncryption | null }
        }
    }
}
export const OrdersController = {

    // To admin actions
    async getById(req: Request, res: Response) {

        try {

            const { id } = req.params
            if (!id) throw new ClientError('The id must be correct')
            const order = await OrderModel.getById(id)
            if (!order) throw new ClientError('This order already not exists')

            const orderReturn = await this.orderReturn(order)
            res.status(200).json(orderReturn)

        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getAll(_: Request, res: Response) {
        try {
            const orders = await OrderModel.getAll()
            if (!orders[0]) throw new ClientError('There are not orders right now.')

            const ordersReturn = await OrdersController.ordersReturn(orders)
            res.status(200).json(ordersReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    // To operator actions and admin too
    async getPending(_: Request, res: Response) {

        try {
            const pending = await OrderModel.getOrderPending()
            if (!pending) throw new ClientError('There are no pending orders right now.')

            const pendingReturn = await OrdersController.ordersReturn(pending)
            res.status(200).json(pendingReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async setOperator(req: Request, res: Response) {

        try {
            if (!req.session?.userSession) throw new ClientError('User does not login')
            const id_user = req.session.userSession.id_user
            const { id } = req.params
            if (!id_user || !id) throw new ClientError('the ids must be correct')

            const user = await UserModel.getById(id_user)
            const order = await OrderModel.getById(id)
            if (!user || !order) throw new ClientError('This Operator or Order not exists')
            if (order.id_operator) throw new ClientError('This order already has an operator assigned')
            if (user.role != 'operator') throw new UnauthorizedError('This User not be Operator User')
            await OrdersController.verifyOrderAssing(user);
            const updated: Order = {
                ...order,
                id_operator: user.id,
                status: 'inProgress',
                processingAt: Date.now().toString()
            }

            const idUpdated = await OrderModel.update(id, updated)
            const orderUpdated = await OrderModel.getById(idUpdated)

            const orderReturn = await OrdersController.orderReturn(orderUpdated)
            res.status(200).json(orderReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    async getPreparation(req: Request, res: Response) {
        try {
            if (!req.session?.userSession) throw new ClientError('User does not login')
            const id_user = req.session.userSession.id_user
            if (!id_user) throw new ClientError('The id must be correct')
            const orders = await OrderModel.getByOperator(id_user)

            const order = orders.find(order => order.status === 'inProgress')
            if (!order) throw new ClientError('The operator has not been assigned any order')

            const product = await ProductModel.getById(order.id_product)

            const preparation: PreparationOrder = {
                base: product.base,
                amount_base: order.quantity,
                cover: product.cover,
                amount_cover: order.quantity,
                estimated_time_product: product.estimated_time,
                estimated_time_order: product.estimated_time * order.quantity,
                estimated_weight_product: product.estimated_weight,
                estimated_weight_order: product.estimated_weight * order.quantity,
            }
            res.status(200).json(preparation)
        } catch (e) {
            handleError(e as Error, res)
        }
    },


    async setComplete(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) throw new ClientError('The order id must be correct')
            const order = await OrderModel.getById(id)
            if (!order) throw new ClientError('This order not exists')
            if (order.status != 'inProgress') throw new ClientError('The order must be inProgress before to be completed')
            const updated: Order = {
                ...order,
                status: 'done',
                completedAt: Date.now().toString()
            }
            const idUpdated = await OrderModel.update(id, updated)
            const orderUpdated = await OrderModel.getById(idUpdated)


            const orderReturn = await this.orderReturn(orderUpdated)
            res.status(200).json(orderReturn)
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


            const ordersReturn = await OrdersController.ordersReturn(orders)
            res.status(200).json(ordersReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    // To client actions and operator | admin too
    async setPending(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) throw new ClientError('The order id must be correct')
            const order = await OrderModel.getById(id)
            if (!order) throw new ClientError('This order not exists')
            if (order.status != 'eraser') throw new ClientError('The order must be eraser before to be completed')
            const updated: Order = {
                ...order,
                status: 'inHold'
            }
            const idUpdated = await OrderModel.update(id, updated)
            const orderUpdated = await OrderModel.getById(idUpdated)

            const orderReturn = await this.orderReturn(orderUpdated)
            res.status(200).json(orderReturn)
        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getMyOrder(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) throw new ClientError('The operator id must be correct')
            if (!req.session?.userSession) throw new ClientError('User does not login')
            const id_user = req.session.userSession.id_user
            if (!id_user) throw new ClientError('User does not login')
            const order = await OrderModel.getById(id)
            if (!order) throw new ClientError('Order does not exist')
            if (order.id_client !== id_user) throw new ClientError('The order must be yours')


            const orderReturn = await OrdersController.orderReturn(order)
            res.status(200).json(orderReturn)

        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async getMyOrders(req: Request, res: Response) {
        try {
            if (!req.session?.userSession) throw new ClientError('User does not login')
            const id_user = req.session.userSession.id_user
            if (!id_user) throw new ClientError('User does not login')
            const orders = await OrderModel.getByClient(id_user)
            if (!orders) throw new ClientError('User does not exist')

            const ordersReturn = await OrdersController.ordersReturn(orders)

            res.status(200).json(ordersReturn)

        } catch (e) {
            handleError(e as Error, res)
        }

    },

    async create(req: Request, res: Response) {
        try {
            const { id_product, quantity } = req.body as PublicCreateOrder
            if (!req.session?.userSession) throw new ClientError('User does not login')
            const id_user = req.session.userSession.id_user
            if (!id_user) throw new ClientError('User does not login')
            const validated = await validateOrder(id_user, id_product, quantity)
            if (!validated.success || !validated.data) {
                if (validated.error instanceof ZodError) {
                    throw validated.error
                }
                throw new ClientError('Validation failed')
            }
            //Get product
            const product = await ProductModel.getById(id_product)
            if (!product) throw new ClientError('The product not exists')

            //Get client
            const client = await UserModel.getById(id_user)
            if (!client) throw new ClientError('The client not exists')

            //Calculate price
            const price = quantity * product.price

            const id = crypto.randomUUID()
            const createdId = await OrderModel.create(id, { id_client: id_user, id_product, quantity, createdAt: Date.now().toString(), status: 'eraser', price })
            if (!createdId) throw new ServerError('Finally could not been created order')

            const createdOrder = await OrderModel.getById(createdId)
            if (!createdOrder) throw new ServerError('The order was not found after creation')


            const orderReturn = await OrdersController.orderReturn(createdOrder)
            res.status(201).json(orderReturn)
        } catch (e) {
            handleError(e as Error, res)
        }
    },

    // SERVICES FUNCTION

    // All requests that return an order must include the name of the users involved and the name of the product.
    async orderReturn(order: Order): Promise<OrderReturn> {

        const product = await ProductModel.getById(order.id_product)
        if (!product) throw new ClientError('The product not exists')
        const material = await MaterialModel.getById(product.id_material)
        if (!material) throw new ClientError('The material not exists')
        const client = await UserModel.getById(order.id_client)
        if (!client) throw new ClientError('The client not exists')
        const operator = order.id_operator ? await UserModel.getById(order.id_operator) : null

        const orderReturn: OrderReturn = {
            ...order,
            product_name: material.type,
            client_name: client?.name || 'Unknown Client', // Use optional chaining and a default value
            operator_name: operator?.name || null // Use optional chaining and a default value
        }

        return orderReturn
    },

    async ordersReturn(orders: Order[]): Promise<OrderReturn[]> {
        return await Promise.all(
            orders.map(async (order) => {
                return await OrdersController.orderReturn(order);
            })
        );
    },
    // The operator only must has one order assing
    async verifyOrderAssing(user: User): Promise<void> {

        const orders = await OrderModel.getByOperator(user.id)
        orders.forEach(order => {
            if (order.status === 'inProgress') {
                throw new ClientError('The operator only must has one order assing')
            }
        })

    },

    // DEPRECATED FUNCTION

    /* 
        async getByClient(req: Request, res: Response) {
            try {
                const { id } = req.params
                if (!id) throw new ClientError('The id must be correct')
    
                const user = await UserModel.getById(id)
                if (!user) throw new ClientError('Probably the user id is not correct')
                if (user.role !== 'client' && user.role !== 'admin') throw new ClientError('The user must be Client or Admin.')
    
                const orders = await OrderModel.getByClient(id)
                if (!orders) throw new ServerError('The orders was not found')
    
                res.status(200).json({ success: true, orders })
            } catch (e) {
                handleError(e as Error, res)
            }
        } */
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const client_error_1 = require("../errors/client.error");
const handleError_1 = require("../errors/handleError");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const orders_schema_1 = require("../schema/orders.schema");
const product_model_1 = require("../models/product.model");
const server_error_1 = require("../errors/server.error");
const zod_1 = require("zod");
const material_model_1 = require("../models/material.model");
exports.OrdersController = {
    // To admin actions
    async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The id must be correct');
            const order = await order_model_1.OrderModel.getById(id);
            if (!order)
                throw new client_error_1.ClientError('This order already not exists');
            const orderReturn = await this.orderReturn(order);
            res.status(200).json(orderReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getAll(_, res) {
        try {
            const orders = await order_model_1.OrderModel.getAll();
            if (!orders[0])
                throw new client_error_1.ClientError('There are not orders right now.');
            const ordersReturn = await exports.OrdersController.ordersReturn(orders);
            res.status(200).json(ordersReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    // To operator actions and admin too
    async getPending(_, res) {
        try {
            const pending = await order_model_1.OrderModel.getOrderPending();
            if (!pending)
                throw new client_error_1.ClientError('There are no pending orders right now.');
            const pendingReturn = await exports.OrdersController.ordersReturn(pending);
            res.status(200).json(pendingReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async setOperator(req, res) {
        try {
            if (!req.session?.userSession)
                throw new client_error_1.ClientError('User does not login');
            const id_user = req.session.userSession.id_user;
            const { id } = req.params;
            if (!id_user || !id)
                throw new client_error_1.ClientError('the ids must be correct');
            const user = await user_model_1.UserModel.getById(id_user);
            const order = await order_model_1.OrderModel.getById(id);
            if (!user || !order)
                throw new client_error_1.ClientError('This Operator or Order not exists');
            if (order.id_operator)
                throw new client_error_1.ClientError('This order already has an operator assigned');
            if (user.role != 'operator')
                throw new client_error_1.UnauthorizedError('This User not be Operator User');
            await exports.OrdersController.verifyOrderAssing(user);
            const updated = {
                ...order,
                id_operator: user.id,
                status: 'inProgress',
                processingAt: Date.now().toString()
            };
            const idUpdated = await order_model_1.OrderModel.update(id, updated);
            const orderUpdated = await order_model_1.OrderModel.getById(idUpdated);
            const orderReturn = await exports.OrdersController.orderReturn(orderUpdated);
            res.status(200).json(orderReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getPreparation(req, res) {
        try {
            if (!req.session?.userSession)
                throw new client_error_1.ClientError('User does not login');
            const id_user = req.session.userSession.id_user;
            if (!id_user)
                throw new client_error_1.ClientError('The id must be correct');
            const orders = await order_model_1.OrderModel.getByOperator(id_user);
            const order = orders.find(order => order.status === 'inProgress');
            if (!order)
                throw new client_error_1.ClientError('The operator has not been assigned any order');
            const product = await product_model_1.ProductModel.getById(order.id_product);
            const preparation = {
                id: order.id,
                base: product.base,
                amount_base: order.quantity,
                cover: product.cover,
                amount_cover: order.quantity,
                estimated_time_product: product.estimated_time,
                estimated_time_order: product.estimated_time * order.quantity,
                estimated_weight_product: product.estimated_weight,
                estimated_weight_order: product.estimated_weight * order.quantity,
            };
            res.status(200).json(preparation);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async setComplete(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The order id must be correct');
            const order = await order_model_1.OrderModel.getById(id);
            if (!order)
                throw new client_error_1.ClientError('This order not exists');
            if (order.status != 'inProgress')
                throw new client_error_1.ClientError('The order must be inProgress before to be completed');
            const updated = {
                ...order,
                status: 'done',
                completedAt: Date.now().toString()
            };
            const idUpdated = await order_model_1.OrderModel.update(id, updated);
            const orderUpdated = await order_model_1.OrderModel.getById(idUpdated);
            const orderReturn = await exports.OrdersController.orderReturn(orderUpdated);
            res.status(200).json(orderReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getByOperator(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The operator id must be correct');
            const operator = await user_model_1.UserModel.getById(id);
            if (!operator)
                throw new client_error_1.ClientError('The operator not exists');
            if (operator.role != 'operator')
                throw new client_error_1.ClientError('This user must be Operator User');
            const orders = await order_model_1.OrderModel.getByOperator(operator.id);
            if (!orders)
                throw new client_error_1.ClientError('Not exists order by this operator');
            const ordersReturn = await exports.OrdersController.ordersReturn(orders);
            res.status(200).json(ordersReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    // To client actions and operator | admin too
    async setPending(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The order id must be correct');
            const order = await order_model_1.OrderModel.getById(id);
            if (!order)
                throw new client_error_1.ClientError('This order not exists');
            if (order.status != 'draft')
                throw new client_error_1.ClientError('The order must first be a draft to be manufactured.');
            const updated = {
                ...order,
                status: 'inHold',
                processingAt: Date.now().toString()
            };
            console.log(updated);
            const idUpdated = await order_model_1.OrderModel.update(id, updated);
            const orderUpdated = await order_model_1.OrderModel.getById(idUpdated);
            const orderReturn = await exports.OrdersController.orderReturn(orderUpdated);
            res.status(200).json(orderReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getMyOrder(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The operator id must be correct');
            if (!req.session?.userSession)
                throw new client_error_1.ClientError('User does not login');
            const id_user = req.session.userSession.id_user;
            if (!id_user)
                throw new client_error_1.ClientError('User does not login');
            const order = await order_model_1.OrderModel.getById(id);
            if (!order)
                throw new client_error_1.ClientError('Order does not exist');
            if (order.id_client !== id_user)
                throw new client_error_1.ClientError('The order must be yours');
            const orderReturn = await exports.OrdersController.orderReturn(order);
            res.status(200).json(orderReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getMyOrders(req, res) {
        try {
            if (!req.session?.userSession)
                throw new client_error_1.ClientError('User does not login');
            const id_user = req.session.userSession.id_user;
            if (!id_user)
                throw new client_error_1.ClientError('User does not login');
            const orders = await order_model_1.OrderModel.getByClient(id_user);
            if (!orders)
                throw new client_error_1.ClientError('User does not exist');
            const ordersReturn = await exports.OrdersController.ordersReturn(orders);
            res.status(200).json(ordersReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async create(req, res) {
        try {
            const { id_product, quantity } = req.body;
            if (!req.session?.userSession)
                throw new client_error_1.ClientError('User does not login');
            const id_user = req.session.userSession.id_user;
            if (!id_user)
                throw new client_error_1.ClientError('User does not login');
            const validated = await (0, orders_schema_1.validateOrder)(id_user, id_product, quantity);
            if (!validated.success || !validated.data) {
                if (validated.error instanceof zod_1.ZodError) {
                    throw validated.error;
                }
                throw new client_error_1.ClientError('Validation failed');
            }
            //Get product
            const product = await product_model_1.ProductModel.getById(id_product);
            if (!product)
                throw new client_error_1.ClientError('The product not exists');
            //Get client
            const client = await user_model_1.UserModel.getById(id_user);
            if (!client)
                throw new client_error_1.ClientError('The client not exists');
            //Calculate price
            const price = quantity * product.price;
            const id = crypto.randomUUID();
            const createdId = await order_model_1.OrderModel.create(id, { id_client: id_user, id_product, quantity, createdAt: Date.now().toString(), status: 'draft', price });
            if (!createdId)
                throw new server_error_1.ServerError('Finally could not been created order');
            const createdOrder = await order_model_1.OrderModel.getById(createdId);
            if (!createdOrder)
                throw new server_error_1.ServerError('The order was not found after creation');
            const orderReturn = await exports.OrdersController.orderReturn(createdOrder);
            res.status(201).json(orderReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    // SERVICES FUNCTION
    // All requests that return an order must include the name of the users involved and the name of the product.
    async orderReturn(order) {
        const product = await product_model_1.ProductModel.getById(order.id_product);
        if (!product)
            throw new client_error_1.ClientError('The product not exists');
        const material = await material_model_1.MaterialModel.getById(product.id_material);
        if (!material)
            throw new client_error_1.ClientError('The material not exists');
        const client = await user_model_1.UserModel.getById(order.id_client);
        if (!client)
            throw new client_error_1.ClientError('The client not exists');
        const operator = order.id_operator ? await user_model_1.UserModel.getById(order.id_operator) : null;
        const orderReturn = {
            ...order,
            product_name: material.type,
            client_name: client?.name || 'Unknown Client', // Use optional chaining and a default value
            operator_name: operator?.name || null // Use optional chaining and a default value
        };
        return orderReturn;
    },
    async ordersReturn(orders) {
        return await Promise.all(orders.map(async (order) => {
            return await exports.OrdersController.orderReturn(order);
        }));
    },
    // The operator only must has one order assing
    async verifyOrderAssing(user) {
        const orders = await order_model_1.OrderModel.getByOperator(user.id);
        orders.forEach(order => {
            if (order.status === 'inProgress') {
                throw new client_error_1.ClientError('The operator only must has one order assing');
            }
        });
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
};

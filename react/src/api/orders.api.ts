import axios from "axios";
import { API } from "../config";
import { PublicCreateOrder } from "@pawn-to-pawn/shared";

const ordersApi = axios.create({
    baseURL: API + '/orders',
    withCredentials: true,
})

// CREATE ORDERS (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const createOrder = (order: PublicCreateOrder) => {
    return ordersApi.post('', order)
}

// GET ALL ORDERS (ACCESS: ADMIN)
export const getOrders = () => {
    return ordersApi.get('')
}

// GET ORDERS BY ID (ACCESS: ADMIN)
export const getOneOrder = (id: string) => {
    return ordersApi.get(`/${id}`)
}

// GET MY ORDERS (ACCESS: CLIENT | OPERATOR | ADMIN)
export const getMyOrders = () => {
    return ordersApi.get('/all/me')
}

// GET MY ORDER (ACCESS: CLIENT | OPERATOR | ADMIN)
export const getMyOrder = (id: string) => {
    return ordersApi.get(`/me/${id}`)
}

// SET PENDING ORDER (ACCESS: CLIENT | OPERATOR | ADMIN)
export const setPendingOrder = (id: string) => {
    return ordersApi.patch(`/set/pending/${id}`)
}

// GET PENDING ORDER (ACCESS: OPERATOR | ADMIN)
export const getPendingOrders = () => {
    return ordersApi.get('/pending')
}

// SET ORDER TO OPERATOR (ACCESS: OPERATOR)
export const setOrderToOperator = (id: string) => {
    return ordersApi.patch(`/set/operator/${id}`)
}

// GET PREPARATION ORDER (ACCESS: OPERATOR | ADMIN)
export const getPreparationOrder = () => {
    return ordersApi.get(`/preparation`)
}

// GET ORDERS TO OPERATOR (ACCESS: OPERATOR | ADMIN)
export const getOrdersToOperator = (id: string) => {
    return ordersApi.get(`/operator/orders/${id}`)
}

// SET COMPLETE (ACCESS: OPERATOR | ADMIN)
export const setCompleteOrder = (id: string) => {
    return ordersApi.patch(`/set/complete/${id}`)
}

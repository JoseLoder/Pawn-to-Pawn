// Tipos compartidos (usados tanto en frontend como backend)
export type StatusOrder = 'eraser' | 'inHold' | 'inProgress' | 'done'

export type Order = {
    id: string,
    id_client: string,
    id_product: string,
    id_operator: string,
    quantity: number,
    price: number,
    status: StatusOrder,
    createdAt: string,
    processingAt: string,
    completedAt: string
}

export type PublicCreateOrder = Pick<Order, 'id_product' | 'quantity'>
export type CreateOrder = Pick<Order, 'id_client' | 'id_product' | 'quantity' | 'createdAt' | 'status' | 'price'>
export type UpdateOrder = Omit<Order, 'id' | 'id_client' | 'id_product' | 'createdAt'>

export type OrderReturn = {
    id: string,
    id_client: string,
    id_product: string,
    id_operator: string,
    quantity: number,
    price: number,
    status: StatusOrder,
    createdAt: string,
    processingAt: string,
    completedAt: string,
    product_name: string,
    client_name: string,
    operator_name: string | null
}

// Tipos específicos del backend
// Por ahora no hay tipos específicos del backend

// Tipos específicos del frontend
// Por ahora no hay tipos específicos del frontend 
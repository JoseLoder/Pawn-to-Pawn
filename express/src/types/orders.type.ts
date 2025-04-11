export type StatusOrder = 'eraser' | 'inHold' | 'inProgress' | 'done'
export type Order = {
    id: string,
    id_client: string,
    id_product: string,
    id_operator: string,
    quantity: number,
    price: number,
    status: StatusOrder,
    createdAt: TimeRanges,
    processingAt: TimeRanges,
    completedAt: TimeRanges
}

export type CreateOrder = Pick<Order, 'id_client' | 'id_product' | 'quantity'>
export type UpdateOrder = Omit<Order, 'id' | 'id_client' | 'id_product' | 'createdAt'>
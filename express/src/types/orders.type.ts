export type StatusOrder = 'inHold | inProgress | done'
export interface Order {
    id: string,
    idClient: string,
    idProduct: string,
    idOperator: string,
    quantity: number,
    price: number,
    status: StatusOrder,
    createdAt: TimeRanges,
    processingAt: TimeRanges,
    completedAt: TimeRanges
}

export type CreateOrder = Pick<Order, 'idClient' | 'idProduct' | 'quantity'>
export type UpdateOrder = Omit<Order, 'id' | 'idClient' | 'idProduct' | 'createdAt'>
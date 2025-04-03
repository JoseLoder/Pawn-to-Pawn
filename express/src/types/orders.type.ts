export type StatusOrder = 'inHold | inProgress | done'
export interface Orders {
    id: string,
    idClient: string,
    idProduct: string,
    idOperator: string,
    status: StatusOrder,
    createdAt: TimeRanges,
    processingAt: TimeRanges,
    completedAt: TimeRanges
}

export type CreateOrder = Pick<Orders, 'idClient' | 'idProduct'>
export type UpdateOrder = Omit<CreateOrder, 'dni'>
export type Machine = {
    id: string,
    max_widht: number,
    max_weight: number,
    max_velocity: number,
    price: number
}

export type CreateMachine = Omit<Machine, 'id'>
export type UpdateMachine = Omit<Machine, 'id'>
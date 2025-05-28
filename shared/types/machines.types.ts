// Tipos compartidos (usados tanto en frontend como backend)
export type Machine = {
    id: string,
    max_widht: number,
    max_weight: number,
    max_velocity: number,
    price: number
}

export type CreateMachine = Omit<Machine, 'id'>
export type UpdateMachine = Omit<Machine, 'id'>

// Tipos específicos del backend
// Por ahora no hay tipos específicos del backend

// Tipos específicos del frontend
// Por ahora no hay tipos específicos del frontend 
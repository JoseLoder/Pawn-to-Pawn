// Tipos compartidos (usados tanto en frontend como backend)
export interface Client {
    id: string,
    dni: string,
    name: string,
    email: string,
    phone: string
}

export type CreateClient = Omit<Client, 'id'>
export type UpdateClient = Omit<CreateClient, 'dni'>

// Tipos específicos del backend
// Por ahora no hay tipos específicos del backend

// Tipos específicos del frontend
// Por ahora no hay tipos específicos del frontend 
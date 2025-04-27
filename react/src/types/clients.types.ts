export interface Client {
    id: string,
    dni: string,
    name: string,
    email: string,
    phone: string
}

export type CreateClient = Omit<Client, 'id'>
export type UpdateClient = Omit<CreateClient, 'dni'>
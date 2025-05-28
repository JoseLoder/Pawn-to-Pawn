// Tipos compartidos (usados tanto en frontend como backend)
export type Material = {
    id: string,
    type: string,
    weight: number,
    price: number
}

export type CreateMaterial = Omit<Material, 'id'>
export type UpdateMaterial = Omit<Material, 'id'>

// Tipos específicos del backend
// Por ahora no hay tipos específicos del backend

// Tipos específicos del frontend
// Por ahora no hay tipos específicos del frontend 
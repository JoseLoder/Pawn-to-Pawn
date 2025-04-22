export type Material = {
    id: string,
    type: string,
    weight: number,
    price: number
}

export type CreateMaterial = Omit<Material, 'id'>
export type UpdateMaterial = Omit<Material, 'id'>

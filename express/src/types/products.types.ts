export interface Product {
    id: string,
    id_machine: string,
    id_base: string,
    id_cover: string,
    id_material: string,
    estimated_time: TimeRanges,
    estimated_weight: number,
    size: number,
    price: number
}

export type CreateProduct = Pick<Product, 'id_machine' | 'id_base' | 'id_cover' | 'id_material'>
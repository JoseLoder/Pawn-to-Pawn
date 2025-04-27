export type Covers = 'white' | 'black' | 'golden'
export type Bases = 'iron' | 'pvc' | 'cardboard'
export type Product = {
    id: string,
    id_machine: string,
    id_material: string,
    base: Bases,
    cover: Covers,
    length: number,
    estimated_time: number,
    estimated_weight: number,
    widht: number,
    price: number
}
export type PreparationOrder = {
    cover: Covers,
    amount_cover: number,
    base: Bases,
    amount_base: number,
    estimated_time_product: number,
    estimated_time_order: number,
    estimated_weight_product: number,
    estimated_weight_order: number,
}


export type CreateProduct = Pick<Product, 'id_machine' | 'base' | 'cover' | 'id_material' | 'length' | 'widht'>
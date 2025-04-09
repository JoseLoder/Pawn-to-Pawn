export type Covers = 'white' | 'black' | 'golden'
export type Bases = 'iron' | 'pvc' | 'cardboard'
export interface Product {
    id: string,
    id_machine: string,
    id_material: string,
    base: Bases,
    cover: Covers,
    lenght: number,
    estimated_time: TimeRanges,
    estimated_weight: number,
    widht: number,
    price: number
}

export type CreateProduct = Pick<Product, 'id_machine' | 'base' | 'cover' | 'id_material' | 'lenght' | 'widht'>
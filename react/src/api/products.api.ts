import axios from "axios";
import { API } from "../config";
import { CreateProduct } from "../types/products.types";

const productsApi = axios.create({
    baseURL: API + '/products',
    withCredentials: true,
})

// GET PRODUCTS (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const getProducts = () => {
    return productsApi.get('')
}

// GET PRODUCTS BY ID (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const getOneProduct = (id: string) => {
    return productsApi.get(`/${id}`)
}

// CREATE PRODUCTS (ACCESS: ADMIN | OPERATOR)
export const createProduct = (product: CreateProduct) => {
    return productsApi.post('', product)
}

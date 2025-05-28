import axios from "axios";
import { CreateMaterial } from "@pawn-to-pawn/shared";
import { API } from "../config";

const materialsApi = axios.create({
    baseURL: API + "/materials",
    withCredentials: true
})

// CREATE MATERIALS (ACCESS: ONLY ADMIN)
export const createMaterial = (material: CreateMaterial) => {
    return materialsApi.post("", material)
}

// GET MATERIALS (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const getAllMaterials = () => {
    return materialsApi.get("")
}

// GET MATERIAL BY ID (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const getOneMaterial = (id: string) => {
    return materialsApi.get(`/${id}`)
}

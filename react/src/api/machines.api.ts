import axios from "axios";
import { CreateMachine } from "@pawn-to-pawn/shared";
import { API } from "../config";

const machinesApi = axios.create({
    baseURL: API + '/machines',
    withCredentials: true,
})

// CREATE MATERIALS (ACCESS: ONLY ADMIN)
export const createMachine = (machine: CreateMachine) => {
    return machinesApi.post('', machine)
}

// GET MATERIALS (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const getAllMachines = () => {
    return machinesApi.get('')
}

// GET MATERIAL BY ID (ACCESS: CLIENTS | OPERATORS | ADMIN)
export const getOneMachine = (id: string) => {
    return machinesApi.get(`/${id}`)
}
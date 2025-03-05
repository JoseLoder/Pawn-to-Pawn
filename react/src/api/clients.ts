import axios from 'axios'

import { RegisterClient } from '../types/Clients'

const clientsApi = axios.create({
    baseURL: 'http://localhost:3000/clients'
})

export const getClients = async () => {
    const res = await clientsApi.get('/')
    return res.data
}
export const getClientsById = async (id: string) => {
    const res = await clientsApi.get(`/${id}`)
    return res.data
}

export const createClient = async (client: RegisterClient) => {
    const res = await clientsApi.post('/', client)
    return res.data
}

export const removeClient = async (id: string) => {
    const res = await clientsApi.delete(`/${id}`)
    return res.data
}
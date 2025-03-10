import axios from 'axios'

import { Client, RegisterClient } from '../types/Clients'

const clientsApi = axios.create({
    baseURL: 'http://localhost:3000/clients',
    withCredentials: true
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

export const modifyClient = async (client: Client) => {
    const res = await clientsApi.put(`/${client.id}`, client)
    return res.data
}
import axios from 'axios'

import { Client, RegisterClient } from '../types/Clients'

const clientsApi = axios.create({
    baseURL: 'http://localhost:3000/clients',
    withCredentials: true
})

export const getClients = () => {
    return clientsApi.get('/')
}

export const getClientsById = (id: string) => {
    return clientsApi.get(`/${id}`)
}

export const createClient = (client: RegisterClient) => {
    return clientsApi.post('/', client)
}

export const removeClient = (id: string) => {
    return clientsApi.delete(`/${id}`)
}

export const modifyClient = (client: Client) => {
    return clientsApi.put(`/${client.id}`, client)
}
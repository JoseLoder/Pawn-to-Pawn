import axios from "axios";
import { LogUser, RegisterUser } from "../types/Users";


const userApi = axios.create({
    baseURL: 'http://localhost:3000/users',
    withCredentials: true
})

export const login = async (user: LogUser) => {
    const res = await userApi.post('/login', user)
    return res.data
}

export const register = async (user: RegisterUser) => {
    const res = await userApi.post('/register', user)
    return res.data
}

export const logout = async () => {
    const res = await userApi.post('/logout')
    return res.data
}
// DEPRECATED FILE

import axios from "axios";
import { LogUser, RegisterUser } from "../types/Users";


const userApi = axios.create({
    baseURL: 'http://localhost:3000/users',
    withCredentials: true
})

export const login = (user: LogUser) => {
    return userApi.post('/login', user)
}

export const register = (user: RegisterUser) => {
    return userApi.post('/register', user)
}

export const logout = () => {
    return userApi.post('/logout')
}
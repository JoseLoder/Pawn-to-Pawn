// DEPRECATED FILE

import axios from "axios";
import { LoginUser, RegisterUser } from "../types/users.types";


const userApi = axios.create({
    baseURL: 'http://localhost:3000/users',
    withCredentials: true
})

export const login = (user: LoginUser) => {
    return userApi.post('/login', user)
}

export const register = (user: RegisterUser) => {
    return userApi.post('/register', user)
}

export const logout = () => {
    return userApi.post('/logout')
}
import axios from "axios";
import { API } from "../config";
import { RegisterUser, LoginUser } from "@pawn-to-pawn/shared";

const usersApi = axios.create({
    baseURL: API + '/users',
    withCredentials: true,
})

// USER CLIENT REGISTER (ACCESS: ALL)
export const registerUser = (user: RegisterUser) => {
    return usersApi.post('/register', user)
}

// USER CLIENT LOGIN (ACCESS: ALL)
export const loginUser = (user: LoginUser) => {
    return usersApi.post('/login', user)
}

// USER LOGOUT (ACCESS: ALL)
export const logoutUser = () => {
    return usersApi.post('/logout')
}

// GET MY USER BY ID (ACCESS: CLIENTS | OPERATOR | ADMIN)
export const getMyUser = () => {
    return usersApi.get('/me')
}

// GET USER BY EMAIL (ACCESS: CLIENTS | OPERATOR | ADMIN)
// export const getUserByEmail = (email: string) => {
//     return usersApi.get(`/email/${email}`)
// }

// GET ALL USERS (ACCESS: ONLY ADMIN)
export const getUsers = () => {
    return usersApi.get('')
}

// GET CLIENTS (ACCESS: OPERATOR | ADMIN)
export const getClients = () => {
    return usersApi.get('/clients')
}

// GET OPERATORS (ACCESS: ONLY ADMIN)
export const getOperators = () => {
    return usersApi.get('/operators')
}

// ASCEND USER CLIENT TO OPERATOR (ACCESS: ONLY ADMIN)
export const ascendUserToOperator = (id: string) => {
    return usersApi.patch(`/${id}`)
}

// DELETE USER (ACCESS: ONLY ADMIN)
export const deleteUser = (id: string) => {
    return usersApi.delete(`/${id}`)
}

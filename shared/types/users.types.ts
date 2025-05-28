// Tipos compartidos (usados tanto en frontend como backend)
export type RoleUser = "admin" | "operator" | "client"

export interface User {
  id: string,
  id_number: string
  email: string
  name: string
  phone: string
  password: string
  role: RoleUser
}

export type RegisterUser = Omit<User, 'id' | 'role'>
export type PublicUser = Omit<User, 'password'>

// Tipos específicos del backend
export type LogUser = Pick<User, 'email' | 'password'>

// Tipos específicos del frontend
export type LoginUser = Pick<User, 'email' | 'password'> 
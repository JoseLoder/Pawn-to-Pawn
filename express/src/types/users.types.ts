export type RoleUser = "admin" | "professional" | "client"
export interface User {
  id: string
  email: string
  name: string
  password: string,
  role?: RoleUser
}
export type LogUser = Pick<User, 'email' | 'password'>
export type RegisterUser = Omit<User, 'id'>

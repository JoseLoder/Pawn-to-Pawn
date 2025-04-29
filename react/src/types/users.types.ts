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
export type LoginUser = Pick<User, 'email' | 'password'>
export type RegisterUser = Omit<User, 'id' | 'role'>
export type PublicUser = Pick<User, 'email' | 'name' | 'role'>

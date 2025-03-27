export interface User {
  id: string
  email: string
  name: string
  password: string
}
export type LogUser = Pick<User, 'email' | 'password'>
export type RegisterUser = Omit<User, 'id'>

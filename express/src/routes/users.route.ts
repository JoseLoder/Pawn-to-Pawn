import { Router } from 'express'
import { UsersController } from '../controllers/users.controller.ts'
export const usersRouter = Router()

usersRouter.post('/login', UsersController.login)
usersRouter.post('/register', UsersController.register)
usersRouter.post('/logout', UsersController.logout)
usersRouter.delete('/:id', UsersController.delete)

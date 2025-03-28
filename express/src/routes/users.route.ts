import { Router } from 'express'
import { UserController } from '../controllers/users.controller.ts'
export const usersRouter = Router()

usersRouter.post('/login', UserController.login)
usersRouter.post('/register', UserController.register)
usersRouter.post('/logout', UserController.logout)
usersRouter.delete('/:id', UserController.delete)

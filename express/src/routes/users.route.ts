import { Router } from 'express'
import { UsersController } from '../controllers/users.controller.ts'
import { auth, authClient } from '../middlewares/auth.middleware.ts'

export const UsersRouter = Router()

// Middleware

UsersRouter.use('/', auth)
UsersRouter.use('/', authClient)


UsersRouter.post('/login', UsersController.login)
UsersRouter.post('/register', UsersController.register)
UsersRouter.post('/logout', UsersController.logout)
UsersRouter.delete('/:id', UsersController.delete)

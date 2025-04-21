import { Router } from 'express'
import { UsersController } from '../controllers/users.controller.ts'
import { auth, authClient } from '../middlewares/auth.middleware.ts'
export const usersRouter = Router()


// Middleware

usersRouter.use('/', auth)
usersRouter.use('/', authClient)


usersRouter.post('/login', UsersController.login)
usersRouter.post('/register', UsersController.register)
usersRouter.post('/logout', UsersController.logout)
usersRouter.delete('/:id', UsersController.delete)

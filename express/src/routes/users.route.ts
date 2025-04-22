import { Router } from 'express'
import { UsersController } from '../controllers/users.controller.ts'
import { auth, authAdmin } from '../middlewares/auth.middleware.ts'

export const UsersRouter = Router()

// Endpoints 
UsersRouter.post('/register', UsersController.register)
UsersRouter.post('/login', UsersController.login)
UsersRouter.post('/logout', UsersController.logout)

// Endpoint for admin
UsersRouter.use(auth)
UsersRouter.use(authAdmin)
UsersRouter.patch('/:id', UsersController.setAsWorker)
UsersRouter.delete('/:id', UsersController.delete)


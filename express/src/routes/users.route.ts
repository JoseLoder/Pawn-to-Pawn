import { Router } from 'express'
import { UsersController } from '../controllers/users.controller.ts'
import { auth, authAdmin, authOperator } from '../middlewares/auth.middleware.ts'

export const UsersRouter = Router()

// Endpoints 
UsersRouter.post('/register', UsersController.register)
UsersRouter.post('/login', UsersController.login)
UsersRouter.post('/logout', UsersController.logout)

// Endpoints for clients | operator | admin
UsersRouter.use(auth)
UsersRouter.get('/me', UsersController.getMyUser)
// UsersRouter.get('/email/:email', UsersController.getByEmail)

// Endpoint for admin | operator
UsersRouter.use(authOperator)
UsersRouter.get('/clients', UsersController.getClients)

// Endpoint for admin
UsersRouter.use(authAdmin)
UsersRouter.get('/', UsersController.getAll)
UsersRouter.get('/operators', UsersController.getOperators)
UsersRouter.patch('/:id', UsersController.setAsWorker)
UsersRouter.delete('/:id', UsersController.delete)

import { Router } from 'express'
import { ClientsController } from '../controllers/clients.controller.ts'
import { authClient } from '../middlewares/auth.middleware.ts'
import { auth } from '../middlewares/auth.middleware.ts'

export const clientsRouter = Router()

// Middleware

clientsRouter.use('/', auth)
clientsRouter.use('/', authClient)

// End-Points Clients
clientsRouter.get('/', ClientsController.getAll)
clientsRouter.get('/:id', ClientsController.getById)
clientsRouter.get('/dni/:dni', ClientsController.getByDni)
clientsRouter.post('/', ClientsController.create)
clientsRouter.put('/:id', ClientsController.update)
clientsRouter.delete('/:id', ClientsController.delete)

import { Router } from 'express'
import { ClientsController } from '../controllers/clients.controller.ts'
import { authClient } from '../middleware/auth.clients.ts'
import { auth } from '../middleware/auth.middleware.ts'

export const clientsRouter = Router()

// Middleware

clientsRouter.use('/', auth)
clientsRouter.use('/', authClient)

// End-Points
clientsRouter.get('/', ClientsController.getAll)
clientsRouter.get('/:id', ClientsController.getById)
clientsRouter.get('/dni/:dni', ClientsController.getByDni)
clientsRouter.post('/', ClientsController.create)
clientsRouter.put('/:id', ClientsController.update)
clientsRouter.delete('/:id', ClientsController.delete)

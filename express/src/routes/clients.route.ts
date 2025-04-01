import { Router } from 'express'
import { ClientController } from '../controllers/clients.controller.ts'
import { authClient } from '../middleware/auth.clients.ts'
import { auth } from '../middleware/auth.middleware.ts'

export const clientsRouter = Router()

// Middleware

clientsRouter.use('/', auth)
clientsRouter.use('/', authClient)

// End-Points
clientsRouter.get('/', ClientController.getAll)
clientsRouter.get('/:id', ClientController.getById)
clientsRouter.get('/dni/:dni', ClientController.getByDni)
clientsRouter.post('/', ClientController.create)
clientsRouter.put('/:id', ClientController.update)
clientsRouter.delete('/:id', ClientController.delete)

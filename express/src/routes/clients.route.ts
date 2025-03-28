/* import { Router } from 'express'
import { ClientController } from '../controllers/clients.controller.js'
import { protectedRoute } from '../middleware/protectedRoute.js'

export const clientsRouter = Router()

// Middleware
clientsRouter.use('/', protectedRoute)

// End-Points
clientsRouter.get('/', ClientController.getAll)
clientsRouter.get('/:id', ClientController.getById)
clientsRouter.get('/dni/:dni', ClientController.getByDni)
clientsRouter.post('/', ClientController.create)
clientsRouter.put('/:id', ClientController.update)
clientsRouter.delete('/:id', ClientController.delete) */

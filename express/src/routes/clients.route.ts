import { Router } from 'express'
import { ClientsController } from '../controllers/clients.controller.ts'
import { authClient } from '../middlewares/auth.middleware.ts'
import { auth } from '../middlewares/auth.middleware.ts'

export const ClientsRouter = Router()

// Middleware

ClientsRouter.use('/', auth)
ClientsRouter.use('/', authClient)

// End-Points Clients
ClientsRouter.get('/', ClientsController.getAll)
ClientsRouter.get('/:id', ClientsController.getById)
ClientsRouter.get('/dni/:dni', ClientsController.getByDni)
ClientsRouter.post('/', ClientsController.create)
ClientsRouter.put('/:id', ClientsController.update)
ClientsRouter.delete('/:id', ClientsController.delete)

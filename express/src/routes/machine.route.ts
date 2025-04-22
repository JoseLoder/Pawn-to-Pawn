import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware";
import { MachinesController } from "../controllers/machines.controller";

export const MachinesRoute = Router()

// Middleware
MachinesRoute.use(auth)

// Endpoints
MachinesRoute.get('/', MachinesController.getAll)
MachinesRoute.get('/:id', MachinesController.getById)

// Route for Admin
MachinesRoute.use(authAdmin)
MachinesRoute.post('/', MachinesController.create)
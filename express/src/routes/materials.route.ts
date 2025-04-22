import { Router } from "express";
import { auth, authAdmin } from "../middlewares/auth.middleware";
import { MaterialsController } from "../controllers/materials.controller";

export const MaterialsRoute = Router()

// Middleware
MaterialsRoute.use(auth)

// Endpoints
MaterialsRoute.get('/', MaterialsController.getAll)
MaterialsRoute.get('/:id', MaterialsController.getById)

// Route for Admin
MaterialsRoute.use(authAdmin)
MaterialsRoute.post('/', MaterialsController.create)

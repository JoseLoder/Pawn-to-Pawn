import { Router } from "express";
import { auth, authOperator } from "../middlewares/auth.middleware";
import { ProductsController } from "../controllers/products.controller";

export const ProductsRouter = Router()

// MiddleWare
ProductsRouter.use(auth)
ProductsRouter.use(authOperator)

// EndPoints
ProductsRouter.get('/', ProductsController.getAll)
ProductsRouter.get('/:id', ProductsController.getById)
ProductsRouter.get('/material/:id', ProductsController.getByMaterial)
ProductsRouter.post('/', ProductsController.create)

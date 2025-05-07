import { Router } from "express";
import { auth, authClient, authOperator } from "../middlewares/auth.middleware";
import { ProductsController } from "../controllers/products.controller";

export const ProductsRouter = Router()

// MiddleWare
ProductsRouter.use(auth)
ProductsRouter.use(authClient)

// EndPoints
ProductsRouter.get('/', ProductsController.getAll)
ProductsRouter.get('/:id', ProductsController.getById)
ProductsRouter.get('/material/:id', ProductsController.getByMaterial)
ProductsRouter.use(authOperator)
ProductsRouter.post('/', ProductsController.create)

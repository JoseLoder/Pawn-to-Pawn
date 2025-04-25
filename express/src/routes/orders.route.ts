import { Router } from "express";
import { auth, authAdmin, authClient, authOperator } from "../middlewares/auth.middleware";
import { OrdersController } from "../controllers/orders.controller";

export const OrdersRouter = Router()

// Middleware

OrdersRouter.use(auth)

// Endpoints
// Routes for clients
OrdersRouter.use(authClient)
OrdersRouter.post('/', OrdersController.create)
OrdersRouter.get("/me/:id", OrdersController.getMyOrder)
OrdersRouter.get("/all/me", OrdersController.getMyOrders)
// Routes for operators
OrdersRouter.use(authOperator)
OrdersRouter.get("/operator/pending", OrdersController.getPending)
OrdersRouter.get("/operator/orders/:id", OrdersController.getByOperator)
OrdersRouter.get("/operator/assing/:id_operator&:id_order", OrdersController.setOperator)
OrdersRouter.get("/operator/completed/:id", OrdersController.setCompleted)

//Endpoints for Admin
OrdersRouter.use(authAdmin)
OrdersRouter.get("/", OrdersController.getAll)
OrdersRouter.get("/:id", OrdersController.getById)


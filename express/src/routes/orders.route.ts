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
OrdersRouter.patch("/set/pending/:id", OrdersController.setPending)

// Routes for operators
OrdersRouter.use(authOperator)
OrdersRouter.get("/pending", OrdersController.getPending)
OrdersRouter.get("/preparation/:id", OrdersController.getPreparation)
OrdersRouter.get("/operator/orders/:id", OrdersController.getByOperator)
OrdersRouter.patch("/set/operator/:id", OrdersController.setOperator)
OrdersRouter.patch("/set/complete/:id", OrdersController.setComplete)

//Endpoints for Admin
OrdersRouter.use(authAdmin)
OrdersRouter.get("/", OrdersController.getAll)
OrdersRouter.get("/:id", OrdersController.getById)


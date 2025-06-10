"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const orders_controller_1 = require("../controllers/orders.controller");
exports.OrdersRouter = (0, express_1.Router)();
// Middleware
exports.OrdersRouter.use(auth_middleware_1.auth);
// Endpoints
// Routes for clients
exports.OrdersRouter.use(auth_middleware_1.authClient);
exports.OrdersRouter.post('/', orders_controller_1.OrdersController.create);
exports.OrdersRouter.get("/me/:id", orders_controller_1.OrdersController.getMyOrder);
exports.OrdersRouter.get("/all/me", orders_controller_1.OrdersController.getMyOrders);
exports.OrdersRouter.patch("/set/pending/:id", orders_controller_1.OrdersController.setPending);
// Routes for operators
exports.OrdersRouter.use(auth_middleware_1.authOperator);
exports.OrdersRouter.get("/pending", orders_controller_1.OrdersController.getPending);
exports.OrdersRouter.get("/preparation", orders_controller_1.OrdersController.getPreparation);
exports.OrdersRouter.get("/operator/orders/:id", orders_controller_1.OrdersController.getByOperator);
exports.OrdersRouter.patch("/set/operator/:id", orders_controller_1.OrdersController.setOperator);
exports.OrdersRouter.patch("/set/complete/:id", orders_controller_1.OrdersController.setComplete);
//Endpoints for Admin
exports.OrdersRouter.use(auth_middleware_1.authAdmin);
exports.OrdersRouter.get("/", orders_controller_1.OrdersController.getAll);
exports.OrdersRouter.get("/:id", orders_controller_1.OrdersController.getById);

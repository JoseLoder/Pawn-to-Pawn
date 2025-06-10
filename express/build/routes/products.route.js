"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const products_controller_1 = require("../controllers/products.controller");
exports.ProductsRouter = (0, express_1.Router)();
// MiddleWare
exports.ProductsRouter.use(auth_middleware_1.auth);
exports.ProductsRouter.use(auth_middleware_1.authClient);
// EndPoints
exports.ProductsRouter.get('/', products_controller_1.ProductsController.getAll);
exports.ProductsRouter.get('/:id', products_controller_1.ProductsController.getById);
exports.ProductsRouter.get('/material/:id', products_controller_1.ProductsController.getByMaterial);
exports.ProductsRouter.use(auth_middleware_1.authOperator);
exports.ProductsRouter.post('/', products_controller_1.ProductsController.create);

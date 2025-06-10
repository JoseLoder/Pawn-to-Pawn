"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const materials_controller_1 = require("../controllers/materials.controller");
exports.MaterialsRoute = (0, express_1.Router)();
// Middleware
exports.MaterialsRoute.use(auth_middleware_1.auth);
// Endpoints
exports.MaterialsRoute.get('/', materials_controller_1.MaterialsController.getAll);
exports.MaterialsRoute.get('/:id', materials_controller_1.MaterialsController.getById);
// Route for Admin
exports.MaterialsRoute.use(auth_middleware_1.authAdmin);
exports.MaterialsRoute.post('/', materials_controller_1.MaterialsController.create);

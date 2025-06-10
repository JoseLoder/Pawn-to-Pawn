"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachinesRoute = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const machines_controller_1 = require("../controllers/machines.controller");
exports.MachinesRoute = (0, express_1.Router)();
// Middleware
exports.MachinesRoute.use(auth_middleware_1.auth);
// Endpoints
exports.MachinesRoute.get('/', machines_controller_1.MachinesController.getAll);
exports.MachinesRoute.get('/:id', machines_controller_1.MachinesController.getById);
// Route for Admin
exports.MachinesRoute.use(auth_middleware_1.authAdmin);
exports.MachinesRoute.post('/', machines_controller_1.MachinesController.create);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRouter = void 0;
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.UsersRouter = (0, express_1.Router)();
// Endpoints 
exports.UsersRouter.post('/register', users_controller_1.UsersController.register);
exports.UsersRouter.post('/login', users_controller_1.UsersController.login);
exports.UsersRouter.post('/logout', users_controller_1.UsersController.logout);
// Endpoints for clients | operator | admin
exports.UsersRouter.use(auth_middleware_1.auth);
exports.UsersRouter.get('/me', users_controller_1.UsersController.getMyUser);
// UsersRouter.get('/email/:email', UsersController.getByEmail)
// Endpoint for admin | operator
exports.UsersRouter.use(auth_middleware_1.authOperator);
exports.UsersRouter.get('/clients', users_controller_1.UsersController.getClients);
// Endpoint for admin
exports.UsersRouter.use(auth_middleware_1.authAdmin);
exports.UsersRouter.get('/', users_controller_1.UsersController.getAll);
exports.UsersRouter.get('/operators', users_controller_1.UsersController.getOperators);
exports.UsersRouter.patch('/:id', users_controller_1.UsersController.setAsWorker);
exports.UsersRouter.delete('/:id', users_controller_1.UsersController.delete);

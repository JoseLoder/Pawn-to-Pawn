"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
const client_error_1 = require("../errors/client.error");
const users_schema_1 = require("../schema/users.schema");
const server_error_1 = require("../errors/server.error");
const handleError_1 = require("../errors/handleError");
const refreshTokens_controller_1 = require("./refreshTokens.controller");
exports.UsersController = {
    async getMyUser(req, res) {
        try {
            if (!req.session?.userSession)
                throw new client_error_1.ClientError('User does not login');
            const id_user = req.session.userSession.id_user;
            if (!id_user)
                throw new client_error_1.ClientError('User does not login');
            const user = await user_model_1.UserModel.getById(id_user);
            if (!user)
                throw new client_error_1.ClientError('User does not exist');
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The id must be correct');
            const user = await user_model_1.UserModel.getById(id);
            if (!user)
                throw new client_error_1.ClientError('User does not exist');
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getByEmail(req, res) {
        try {
            const { email } = req.params;
            if (!email)
                throw new client_error_1.ClientError('The email must be correct');
            const user = await user_model_1.UserModel.getByEmail(email);
            if (!user)
                throw new client_error_1.ClientError('User does not exist');
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getAll(_, res) {
        try {
            let usersWithoutPassword = [];
            const users = await user_model_1.UserModel.getAll();
            if (!users[0])
                throw new client_error_1.ClientError('There are not users right now.');
            users.forEach((user) => {
                const { password: _, ...userWithoutPassword } = user;
                usersWithoutPassword.push(userWithoutPassword);
            });
            res.status(200).json(usersWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getClients(_, res) {
        try {
            let clientsWithoutPassword = [];
            const users = await user_model_1.UserModel.getAll();
            if (!users[0])
                throw new client_error_1.ClientError('There are not users right now.');
            users.forEach((user) => {
                if (user.role === 'client') {
                    const { password: _, ...clientWithoutPassword } = user;
                    clientsWithoutPassword.push(clientWithoutPassword);
                }
            });
            res.status(200).json(clientsWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getOperators(_, res) {
        try {
            let operatorsWithoutPassword = [];
            const users = await user_model_1.UserModel.getAll();
            if (!users[0])
                throw new client_error_1.ClientError('There are not users right now.');
            users.forEach((user) => {
                if (user.role === 'operator') {
                    const { password: _, ...operatorWithoutPassword } = user;
                    operatorsWithoutPassword.push(operatorWithoutPassword);
                }
            });
            res.status(200).json(operatorsWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async login(req, res) {
        try {
            req.session = { userSession: null };
            const { email, password } = req.body;
            const validated = await (0, users_schema_1.validateLogin)({ email, password });
            if (!validated.success || !validated.data) {
                if (validated.error instanceof zod_1.ZodError) {
                    throw validated.error;
                }
                throw new client_error_1.ClientError('Validation failed');
            }
            const user = await user_model_1.UserModel.getByEmail(validated.data.email);
            if (!user) {
                throw new client_error_1.ClientError('Invalid credentials');
            }
            const isValid = await bcrypt_1.default.compare(password.trim(), user.password);
            if (!isValid) {
                throw new client_error_1.ClientError('Invalid credentials');
            }
            const accessToken = jsonwebtoken_1.default.sign({
                id_user: user.id,
                role: user.role,
            }, process.env.SECRET_JWT_KEY ?? 'fallback_secret', {
                expiresIn: '60m',
            });
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: 60 * 60 * 1000,
                path: '/',
            };
            req.session = {
                userSession: {
                    id_user: user.id,
                    role: user.role,
                },
            };
            const refreshToken = await refreshTokens_controller_1.RefreshTokensController.create(user.id, req.headers['user-agent']);
            res
                .status(200)
                .cookie('access_token', accessToken, cookieOptions)
                .cookie('refresh_token', refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
                .json({ email: user.email, name: user.name, role: user.role });
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async register(req, res) {
        try {
            const { email, name, password, id_number, phone } = req.body;
            const validated = await (0, users_schema_1.validateUser)({ email, name, password, id_number, phone });
            if (!validated.success || !validated.data) {
                if (validated.error instanceof zod_1.ZodError) {
                    throw validated.error;
                }
                throw new client_error_1.ClientError('Validation failed');
            }
            const exists = await user_model_1.UserModel.getByEmail(email);
            if (exists) {
                throw new client_error_1.ClientError('This client already exists');
            }
            const salt = await bcrypt_1.default.genSalt(10);
            const hash = await bcrypt_1.default.hash(validated.data.password, salt);
            if (!hash) {
                throw new server_error_1.ServerError('Password hashing failed');
            }
            const id = crypto.randomUUID();
            const user = {
                ...validated.data,
                password: hash,
            };
            const createdUserId = await user_model_1.UserModel.create(id, user);
            if (!createdUserId) {
                throw new server_error_1.ServerError('Finally the user was not be created');
            }
            const createdUser = await user_model_1.UserModel.getById(createdUserId);
            if (!createdUser) {
                throw new server_error_1.ServerError('The user was not found after creation.');
            }
            const { password: _, ...userWithoutPassword } = createdUser;
            res.status(201).json(userWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async logout(req, res) {
        try {
            /*   const refreshToken = req.cookies.refresh_token
              console.log(refreshToken)
              if (refreshToken) {
                const refreshTokenDB = await RefreshTokensController.getByToken(refreshToken)
                await RefreshTokensController.revoke(refreshTokenDB.token)
                await RefreshTokensController.revokeAllForUserDevice(refreshTokenDB.id_user, req.headers['user-agent'])
              } */
            //Remove user session
            req.session = { userSession: null };
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                path: '/',
            };
            res
                .status(200)
                .clearCookie('access_token', cookieOptions)
                .clearCookie('refresh_token', cookieOptions)
                .json('Logout successful');
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async setAsWorker(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The id must be correct');
            const user = await user_model_1.UserModel.getById(id);
            if (!user)
                throw new client_error_1.ClientError('This user not exists');
            if (user.role !== 'client')
                throw new client_error_1.ClientError('This user must be a client');
            const operatorUserId = await user_model_1.UserModel.createOperator(user.id);
            if (!operatorUserId)
                throw new server_error_1.ServerError('Could not be created a new worker');
            const operatorUser = await user_model_1.UserModel.getById(operatorUserId);
            if (operatorUser.role != 'operator')
                throw new server_error_1.ServerError('Unknow Error: The client user can not be convert to operator user');
            const { password: _, ...userWithoutPassword } = operatorUser;
            res.status(200).json(userWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('Id must be correct');
            const user = await user_model_1.UserModel.getById(id);
            if (!user)
                throw new client_error_1.ClientError('User does not exists');
            if (user.role === 'admin')
                throw new client_error_1.ClientError('The administrator user cannot be deleted');
            const erased = await user_model_1.UserModel.delete(id);
            if (!erased)
                throw new server_error_1.ServerError('Finally the user was not deleted');
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
};

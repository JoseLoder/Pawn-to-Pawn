"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachinesController = void 0;
const client_error_1 = require("../errors/client.error");
const handleError_1 = require("../errors/handleError");
const machine_model_1 = require("../models/machine.model");
const machine_schema_1 = require("../schema/machine.schema");
const zod_1 = require("zod");
const server_error_1 = require("../errors/server.error");
exports.MachinesController = {
    async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The id must be correct');
            const order = await machine_model_1.MachineModel.getById(id);
            if (!order)
                throw new client_error_1.ClientError('This machine already not exists');
            res.status(200).json(order);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getAll(_, res) {
        try {
            const orders = await machine_model_1.MachineModel.getAll();
            if (!orders)
                throw new client_error_1.ClientError('There are no orders right now.');
            res.status(200).json(orders);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async create(req, res) {
        try {
            const { max_velocity, max_weight, max_widht, price } = req.body;
            const validated = await (0, machine_schema_1.validateMachine)({ price, max_velocity, max_weight, max_widht });
            if (!validated.success || !validated.data) {
                if (validated.error instanceof zod_1.ZodError) {
                    throw validated.error;
                }
                throw new client_error_1.ClientError('Validation failed');
            }
            const id = crypto.randomUUID();
            const machineId = await machine_model_1.MachineModel.create(id, { max_velocity, max_weight, max_widht, price });
            if (!machineId)
                throw new server_error_1.ServerError('Finally could not been created machine');
            const createdMachine = await machine_model_1.MachineModel.getById(machineId);
            if (!createdMachine)
                throw new server_error_1.ServerError('The machine was not found after creation.');
            res.status(201).json(createdMachine);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsController = void 0;
const client_error_1 = require("../errors/client.error");
const material_model_1 = require("../models/material.model");
const handleError_1 = require("../errors/handleError");
const material_schema_1 = require("../schema/material.schema");
const zod_1 = require("zod");
const server_error_1 = require("../errors/server.error");
exports.MaterialsController = {
    async getById(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('The id must be correct');
            const materials = await material_model_1.MaterialModel.getById(id);
            if (!materials)
                throw new client_error_1.ClientError('This material already not exists');
            res.status(200).json(materials);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getAll(_, res) {
        try {
            const materials = await material_model_1.MaterialModel.getAll();
            if (!materials)
                throw new client_error_1.ClientError('There are no orders right now.');
            res.status(200).json(materials);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async create(req, res) {
        try {
            const { price, type, weight } = req.body;
            const validated = await (0, material_schema_1.validateMaterial)({ price, type, weight });
            if (!validated.success || !validated.data) {
                if (validated.error instanceof zod_1.ZodError) {
                    throw validated.error;
                }
                throw new client_error_1.ClientError('Validation failed');
            }
            const id = crypto.randomUUID();
            const materialId = await material_model_1.MaterialModel.create(id, { price, type, weight });
            if (!materialId)
                throw new server_error_1.ServerError('Finally could not been created material');
            const createdMaterial = await material_model_1.MaterialModel.getById(materialId);
            if (!createdMaterial)
                throw new server_error_1.ServerError('The material was not found after creation.');
            res.status(201).json(createdMaterial);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    }
};

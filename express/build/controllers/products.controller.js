"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const handleError_1 = require("../errors/handleError");
const product_model_1 = require("../models/product.model");
const client_error_1 = require("../errors/client.error");
const products_schema_1 = require("../schema/products.schema");
const zod_1 = require("zod");
const material_model_1 = require("../models/material.model");
const machine_model_1 = require("../models/machine.model");
const server_error_1 = require("../errors/server.error");
exports.ProductsController = {
    async getAll(_, res) {
        try {
            const products = await product_model_1.ProductModel.getAll();
            if (!products) {
                throw new client_error_1.ClientError('Products does not exists');
            }
            const productsReturn = await exports.ProductsController.productsReturn(products);
            res.status(200).json(productsReturn);
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
            const product = await product_model_1.ProductModel.getById(id);
            if (!product)
                throw new client_error_1.ClientError(`The product by this id ${id} not exists`);
            const productReturn = await exports.ProductsController.productReturn(product);
            res.status(200).json(productReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async getByMaterial(req, res) {
        try {
            const { id_material } = req.params;
            if (!id_material)
                throw new client_error_1.ClientError('The id_material must be correct');
            const products = await product_model_1.ProductModel.getByMaterial(id_material);
            if (!products)
                throw new client_error_1.ClientError('Products does not exists');
            const productsReturn = await exports.ProductsController.productsReturn(products);
            res.status(200).json(productsReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async create(req, res) {
        const { base, cover, id_machine, id_material, length, widht } = req.body;
        try {
            // validate all by Zod
            const validated = await (0, products_schema_1.validateProduct)({ id_machine, id_material, base, cover, length, widht });
            if (!validated.success || !validated.data) {
                if (validated.error instanceof zod_1.ZodError) {
                    throw validated.error;
                }
                throw new client_error_1.ClientError('Validation failed');
            }
            //serch id_material to get: weight
            const material = await material_model_1.MaterialModel.getById(id_material);
            if (!material) {
                throw new client_error_1.ClientError('This material not exists');
            }
            // get lenght(meters) * Material.weight(g) = estimated_weight(g)
            // Example: 40m * 500g = 20000g
            const estimated_weight = material.weight * length;
            //search id_machine to get: Max_widht,Max_velocity,Max_weight
            const machine = await machine_model_1.MachineModel.getById(id_machine);
            if (!machine) {
                throw new client_error_1.ClientError('This machine not exists');
            }
            // check weight(g) < Machine.Max_weight(g)
            if (estimated_weight > machine.max_weight) {
                throw new client_error_1.ClientError(`
                    This machine is too small for that product, 
                    choose another machine that supports MORE WEIGHT,
                    OR REDUCE THE LENGTH of the product.
                `);
            }
            // check widht(mm) < Machine.Max_widht(mm)
            if (widht > machine.max_widht)
                throw new client_error_1.ClientError(`
                        This machine is too narrow for that product, 
                        choose another WIDER MACHINE, 
                        OR REDUCE THE WIDTH of the product.
                `);
            // get (weight(g) / Machine.Max_velocity(g/minutes)) = estimated_time(minutes)
            // Example: 20000g / 1000g = 20 minutes(per product)
            const estimated_time = estimated_weight / machine.max_velocity;
            // Calculate price Material, lenght(meters) * Material.Price(euros). (Calculated by the transportation of the material, its cost, handling and benefits)
            // Example: 40(m) * 1.5(euros) = 60(euros)
            const priceMaterial = length * material.price;
            // Calculate price machine, estimated_weight * Machine.Price(euros). (Calculated by the maintenance of the machine and the personnel working on it and benefits)
            // Example: 20000(g) * 1.5(euros) = 30000(euros) / 1000 = 30(euros)
            const priceMachine = (estimated_weight * machine.price) / 1000;
            // Total Price, priceMaterial + PriceMachine
            // Example:  60(euros) + 30(euros) = 90 euros(per product)
            const price = priceMaterial + priceMachine;
            const product = {
                id: crypto.randomUUID(),
                id_machine,
                id_material,
                base,
                cover,
                widht,
                length,
                estimated_time,
                estimated_weight,
                price
            };
            const productId = await product_model_1.ProductModel.create(product);
            if (!productId) {
                throw new server_error_1.ServerError('Finally could not been created product');
            }
            const createdProduct = await product_model_1.ProductModel.getById(productId);
            if (!createdProduct) {
                throw new server_error_1.ServerError('The product was not found after creation.');
            }
            const productReturn = await exports.ProductsController.productReturn(createdProduct);
            res.status(200).json(productReturn);
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    // SERVICES FUNCTION 
    productReturn: async (product) => {
        const material = await material_model_1.MaterialModel.getById(product.id_material);
        if (!material)
            throw new client_error_1.ClientError('The material not exists');
        const productReturn = {
            ...product,
            product_name: material.type
        };
        return productReturn;
    },
    productsReturn: async (products) => {
        return await Promise.all(products.map(async (product) => {
            return await exports.ProductsController.productReturn(product);
        }));
    }
};

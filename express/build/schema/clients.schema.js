"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateClient = validateClient;
exports.validateClientUpdate = validateClientUpdate;
const zod_1 = require("zod");
const clientRegisterSchema = zod_1.z.object({
    dni: zod_1.z.string().length(9),
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().length(9)
});
const clientUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().length(9)
});
function validateClient({ dni, name, email, phone }) {
    return clientRegisterSchema.safeParseAsync({ dni, name, email, phone });
}
function validateClientUpdate({ name, email, phone }) {
    return clientUpdateSchema.safeParseAsync({ name, email, phone });
}

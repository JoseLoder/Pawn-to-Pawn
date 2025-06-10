"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMaterial = validateMaterial;
const zod_1 = require("zod");
const MaterialRegisterSchema = zod_1.z.object({
    price: zod_1.z.number().min(.1),
    type: zod_1.z.string().min(3),
    weight: zod_1.z.number().min(1000)
});
function validateMaterial({ price, type, weight }) {
    return MaterialRegisterSchema.safeParseAsync({ price, type, weight });
}

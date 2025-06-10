"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProduct = validateProduct;
const zod_1 = require("zod");
const ProductRegisterSchema = zod_1.z.object({
    id_machine: zod_1.z.string(),
    id_material: zod_1.z.string(),
    base: zod_1.z.enum(['iron', 'pvc', 'cardboard']),
    cover: zod_1.z.enum(['black', 'white', 'golden']),
    length: zod_1.z.number().min(5),
    widht: zod_1.z.number().min(500)
});
function validateProduct({ id_machine, id_material, base, cover, length, widht }) {
    return ProductRegisterSchema.safeParseAsync({ id_machine, id_material, base, cover, length, widht });
}

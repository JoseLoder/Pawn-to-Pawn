"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrder = validateOrder;
const zod_1 = require("zod");
const OrderRegisterSchema = zod_1.z.object({
    id_client: zod_1.z.string(),
    id_product: zod_1.z.string(),
    quantity: zod_1.z.number().min(1)
});
function validateOrder(id_client, id_product, quantity) {
    return OrderRegisterSchema.safeParseAsync({ id_client, id_product, quantity });
}

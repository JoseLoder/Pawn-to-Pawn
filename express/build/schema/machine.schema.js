"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMachine = validateMachine;
const zod_1 = require("zod");
const MachineRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    price: zod_1.z.number().min(.1),
    max_velocity: zod_1.z.number().min(500),
    max_weight: zod_1.z.number().min(1000),
    max_widht: zod_1.z.number().min(1000)
});
function validateMachine({ name, price, max_velocity, max_weight, max_widht }) {
    return MachineRegisterSchema.safeParseAsync({ name, price, max_velocity, max_weight, max_widht });
}

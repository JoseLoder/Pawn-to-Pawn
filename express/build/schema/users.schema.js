"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = validateUser;
exports.validateLogin = validateLogin;
const zod_1 = require("zod");
const userRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    id_number: zod_1.z.string().length(9),
    phone: zod_1.z.string().regex(/^\d+$/).length(9)
});
const userLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
function validateUser({ name, email, password, id_number, phone }) {
    return userRegisterSchema.safeParseAsync({ name, email, password, id_number, phone });
}
function validateLogin({ email, password }) {
    return userLoginSchema.safeParseAsync({ email, password });
}

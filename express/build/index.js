"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const users_route_1 = require("./routes/users.route");
const orders_route_1 = require("./routes/orders.route");
const products_route_1 = require("./routes/products.route");
const materials_route_1 = require("./routes/materials.route");
const machine_route_1 = require("./routes/machine.route");
const AdminManager_1 = require("./database/AdminManager");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT ?? 3000;
const app = (0, express_1.default)();
app.disable('x-powered-by');
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}));
console.log(`CORS origin set to: ${process.env.FRONTEND_URL}`);
app.use((0, express_1.json)());
app.use((0, cookie_parser_1.default)());
// Initialize admin
async function initializeApp() {
    try {
        // Initialize admin user
        await AdminManager_1.AdminManager.getInstance().initializeAdmin();
        // Start server
        app.listen(port, () => {
            console.log(`Server running on ${process.env.FRONTEND_URL}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
}
// Endpoints
app.use('/users', users_route_1.UsersRouter);
app.use('/orders', orders_route_1.OrdersRouter);
app.use('/products', products_route_1.ProductsRouter);
app.use('/materials', materials_route_1.MaterialsRoute);
app.use('/machines', machine_route_1.MachinesRoute);
// 404 Not Found
app.use((_, res) => {
    res.status(404).send('404 Not Found');
});
// Initialize the application
initializeApp();

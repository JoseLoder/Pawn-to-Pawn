"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.ClientError = void 0;
class ClientError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ClientError';
    }
}
exports.ClientError = ClientError;
class UnauthorizedError extends ClientError {
    constructor(message) {
        super(message);
        this.name = 'ClientError';
    }
}
exports.UnauthorizedError = UnauthorizedError;

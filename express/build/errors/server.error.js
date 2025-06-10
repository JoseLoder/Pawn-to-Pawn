"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryError = exports.TableCreationError = exports.ConnectionDatabaseError = exports.ServerError = void 0;
class ServerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServerError';
    }
}
exports.ServerError = ServerError;
class ConnectionDatabaseError extends ServerError {
    constructor(message) {
        super(message);
        this.name = 'ConnectionDatabaseError';
    }
}
exports.ConnectionDatabaseError = ConnectionDatabaseError;
class TableCreationError extends ServerError {
    constructor(message) {
        super(message);
        this.name = 'TableCreationError';
    }
}
exports.TableCreationError = TableCreationError;
class QueryError extends ServerError {
    constructor(message) {
        super('Error executing query: ' + message);
        this.name = 'QueryError';
    }
}
exports.QueryError = QueryError;

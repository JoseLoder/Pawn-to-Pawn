export class ServerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ServerError'
  }
}

export class ConnectionDatabaseError extends ServerError {
  constructor(message) {
    super(message)
    this.name = 'ConnectionDatabaseError'
  }
}
export class TableCreationError extends ServerError {
  constructor(message) {
    super(message)
    this.name = 'TableCreationError'
  }
}
export class QueryError extends ServerError {
  constructor(message) {
    super(message)
    this.name = 'QueryError'
  }
}

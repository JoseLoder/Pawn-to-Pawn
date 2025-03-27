export class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }
}

export class ConnectionDatabaseError extends ServerError {
  constructor(message: string) {
    super(message)
    this.name = 'ConnectionDatabaseError'
  }
}
export class TableCreationError extends ServerError {
  constructor(message: string) {
    super(message)
    this.name = 'TableCreationError'
  }
}
export class QueryError extends ServerError {
  constructor(message: string) {
    super('Error executing query: ' + message)
    this.name = 'QueryError'
  }
}

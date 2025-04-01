export class ClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClientError'
  }
}

export class UnauthorizedError extends ClientError {
  constructor(message: string) {
    super(message)
    this.name = 'ClientError'
  }
}
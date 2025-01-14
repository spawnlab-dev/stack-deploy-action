/**
 * Custom client exceptions
 */

export class ClientError extends Error {
  clientType: string

  constructor(message: string, clientType: string) {
    super(message)
    this.name = 'ClientError'
    this.clientType = clientType
    Object.setPrototypeOf(this, ClientError.prototype)
  }
}

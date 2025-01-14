/**
 * A simple abstract base client implementation
 */

import { Headers } from 'node-fetch'

export abstract class Client {
  abstract host: string
  abstract api_token: string

  getDefaultHeader(): Headers {
    return new Headers({
      Authorization: `Bearer ${this.api_token}`,
      'Content-Type': 'application/json'
    })
  }

  abstract deploy(stack_name: string, compose_file: string): Promise<void>

  abstract delete(stack_name: string): Promise<void>

  abstract isPresent(stack_name: string): Promise<boolean>
}

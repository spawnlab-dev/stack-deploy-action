/**
 * Portainer http client wrapper for docker swarm
 * stack management.
 */

import * as core from '@actions/core'
import fetch, { FetchError, Headers } from 'node-fetch'
import fs from 'fs'
import util from 'util'

import { Client } from './client.js'
import { ClientError } from './error.js'

interface Stack {
  Id: number
  Name: string
  EndpointId: number
}

export class PortainerClient extends Client {
  private stackBasePath = 'api/stacks'
  private stack: Stack | undefined

  host: string
  api_token: string
  endPointId: string
  swarmId: string

  constructor(
    host: string,
    api_token: string,
    endPointId: string,
    swarmId: string
  ) {
    super()
    this.host = host
    this.api_token = api_token
    this.endPointId = endPointId
    this.swarmId = swarmId
  }

  async deploy(stack_name: string, compose_file: string): Promise<void> {
    const readFile = util.promisify(fs.readFile)
    const composeFileContents = await readFile(compose_file, 'utf-8')

    let postBody = undefined
    let endpoint = `${this.host}/${this.stackBasePath}`
    let message = `Successfully deployed stack ${stack_name}`
    let method = 'post'

    try {
      if ((await this.isPresent(stack_name)) && this.stack) {
        endpoint += `/${this.stack.Id}?endpointId=${this.endPointId}`
        postBody = {
          stackFileContent: composeFileContents,
          prune: true,
          pullImage: true
        }
        method = 'put'
        message = `Successfully redeployed stack ${stack_name}`
      } else {
        endpoint += `/create/swarm/string?endpointId=${this.endPointId}`
        postBody = {
          name: stack_name,
          stackFileContent: composeFileContents,
          swarmID: this.swarmId
        }
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: this.getRequestHeader(),
        body: JSON.stringify(postBody)
      })

      if (!response.ok) {
        core.setFailed(
          `Stack deployment failed with client response ${response.status}`
        )
      }
      core.info(message)
    } catch (error) {
      let errorMessage = 'Unknown error'
      if (error instanceof Error)
        errorMessage = `Failed to deploy stack ${stack_name} error: ${error.message}`
      if (error instanceof FetchError)
        errorMessage = `Failed to deploy stack ${stack_name} error: ${error.message} ${error.code}`

      throw new ClientError(errorMessage, PortainerClient.name)
    }
  }

  async delete(stack_name: string): Promise<void> {
    let endpoint = `${this.host}/${this.stackBasePath}`

    try {
      if ((await this.isPresent(stack_name)) && this.stack) {
        endpoint += `/${this.stack.Id}?endpointId=${this.endPointId}`
        const response = await fetch(endpoint, {
          method: 'delete',
          headers: this.getRequestHeader()
        })

        if (!response.ok) {
          core.setFailed(
            `Stack deletion failed with client response ${response.status}`
          )
        }

        core.info(`Successfully deleted stack ${stack_name}`)
      } else {
        core.setFailed(
          `Stack deletion failed because ${stack_name} doesn't exits`
        )
      }
    } catch (error) {
      let errorMessage = 'Unknown error'
      if (error instanceof Error)
        errorMessage = `Failed to deploy stack ${stack_name} error: ${error.message}`
      if (error instanceof FetchError)
        errorMessage = `Failed to deploy stack ${stack_name} error: ${error.message} ${error.code}`

      throw new ClientError(errorMessage, PortainerClient.name)
    }
  }

  async isPresent(stack_name: string): Promise<boolean> {
    try {
      const stacks: Array<Stack> = await this.getAllStacks()
      if (stacks?.length) {
        stacks.forEach((stack: Stack) => {
          if (stack.Name === stack_name) {
            this.stack = stack
            return true
          }
        })
      }
    } catch (error) {
      let errorMessage = 'Unknown error'
      if (error instanceof Error)
        errorMessage = `Failed to check if stack exists ${error.message}`
      if (error instanceof FetchError)
        errorMessage = `Failed to check if stack exists ${error.message} ${error.type}`

      throw new Error(errorMessage)
    }

    return false
  }

  getRequestHeader(): Headers {
    return new Headers({
      Authorization: `X-API-Key ${this.api_token}`,
      'Content-Type': 'application/json'
    })
  }

  private async getAllStacks(): Promise<Array<Stack>> {
    const encodeFilter = encodeURIComponent(
      JSON.stringify({ SwarmId: `${this.swarmId}` })
    )
    const endpoint = `${this.host}/${this.stackBasePath}?filters=${encodeFilter}`

    let stacks: Stack[] = []

    try {
      const response = await fetch(endpoint, {
        method: 'get',
        headers: this.getRequestHeader()
      })

      if (response.ok) {
        stacks = (await response.json()) as Stack[]
      }
    } catch (error) {
      let errorMessage = 'Unknown error'
      if (error instanceof Error)
        errorMessage = `Failed to fetch list of all stacks ${error.message}`
      if (error instanceof FetchError)
        errorMessage = `Failed to fetch list of all stacks ${error.message} ${error.type}`

      throw new Error(errorMessage)
    }

    return stacks
  }
}

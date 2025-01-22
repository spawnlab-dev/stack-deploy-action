/**
 * Swarmpit http client wrapper for docker swarm
 * stack management.
 */

import * as core from '@actions/core'
import fetch, { FetchError, Headers } from 'node-fetch'
import fs from 'fs'
import util from 'util'

import { Client } from './client.js'
import { ClientError } from './error.js'

export class SwarmpitClient extends Client {
  private stackBasePath = 'api/stacks'

  host: string
  api_token: string

  constructor(host: string, api_token: string) {
    super()
    this.host = host
    this.api_token = api_token
  }

  async deploy(stack_name: string, compose_file: string): Promise<void> {
    const readFile = util.promisify(fs.readFile)
    const composeFileContents = await readFile(compose_file, 'utf-8')
    const postBody = {
      name: stack_name,
      spec: {
        compose: composeFileContents
      }
    }

    let endpoint = `${this.host}/${this.stackBasePath}`
    let message = `Successfully deployed stack ${stack_name}`

    try {
      if (await this.isPresent(stack_name)) {
        endpoint += `/${stack_name}`
        message = `Successfully redeployed stack ${stack_name}`
      }

      const response = await fetch(endpoint, {
        method: 'post',
        headers: this.getRequestHeader(),
        body: JSON.stringify(postBody)
      })

      if (!response.ok) {
        core.setFailed(
          `Stack deployment failed with client response ${response.status}`
        )
        return
      }
      core.info(message)
    } catch (error) {
      let errorMessage = 'Unknown error'
      if (error instanceof Error)
        errorMessage = `Failed to deploy stack ${stack_name} error: ${error.message}`
      if (error instanceof FetchError)
        errorMessage = `Failed to deploy stack ${stack_name} error: ${error.message} ${error.code}`

      throw new ClientError(errorMessage, SwarmpitClient.name)
    }
  }

  async delete(stack_name: string): Promise<void> {
    let endpoint = `${this.host}/${this.stackBasePath}`

    try {
      if (await this.isPresent(stack_name)) {
        endpoint += `/${stack_name}`
        const response = await fetch(endpoint, {
          method: 'delete',
          headers: this.getRequestHeader()
        })

        if (!response.ok) {
          core.setFailed(
            `Stack deletion failed with client response ${response.status}`
          )
          return
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

      throw new ClientError(errorMessage, SwarmpitClient.name)
    }
  }

  async isPresent(stack_name: string): Promise<boolean> {
    const endpoint = `${this.host}/${this.stackBasePath}/${stack_name}/file`

    try {
      const response = await fetch(endpoint, {
        method: 'get',
        headers: this.getRequestHeader()
      })

      if (response.ok) {
        return true
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
      Authorization: `Bearer ${this.api_token}`,
      'Content-Type': 'application/json'
    })
  }
}

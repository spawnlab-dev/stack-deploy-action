import * as core from '@actions/core'

import { SwarmpitClient } from './clients/swarmpit.js'
import { ClientError } from './clients/error.js'
import { Client } from './clients/client.js'
import { PortainerClient } from './clients/portainer.js'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const HOST = core.getInput('host')
    const STACK = core.getInput('stack')
    const API_TOKEN = core.getInput('api-token')
    const COMPOSE_FILE = core.getInput('compose')
    const ACTION = core.getInput('action')
    const CLIENT = core.getInput('client')
    const ENDPOINT_ID = core.getInput('endPointId')
    const SWARM_ID = core.getInput('swarmId')

    const client: Client = getClientInstance(
      CLIENT,
      HOST,
      API_TOKEN,
      ENDPOINT_ID,
      SWARM_ID
    )

    switch (ACTION) {
      case 'deploy':
        if (COMPOSE_FILE.length === 0) {
          core.setFailed('Required docker compose file for deploy')
        }
        await client.deploy(STACK, COMPOSE_FILE)
        core.info('Stack deploy action successful')
        break
      case 'delete':
        await client.delete(STACK)
        core.info('Stack delete action successful')
        break
      default:
        throw new Error(`Invalid or un-supported action ${ACTION}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    let errorMessage = 'Unknown error'
    if (error instanceof Error)
      errorMessage = `Stack deploy action failed with client error ${error.message}`
    if (error instanceof ClientError)
      errorMessage = `Stack deploy action failed with client error ${error.message} client: ${error.clientType}`

    core.setFailed(errorMessage)
  }
}

function getClientInstance(
  client: string,
  host: string,
  api_token: string,
  endpoint_id: string,
  swarm_id: string
): Client {
  switch (client) {
    case 'swarmpit':
      return new SwarmpitClient(host, api_token)
    case 'portainer':
      return new PortainerClient(host, api_token, endpoint_id, swarm_id)
    default:
      throw new Error(`Client ${client} not implemented.`)
  }
}

/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { SwarmpitClient } from '../src/clients/swarmpit.js'
import { ClientError } from '../src/clients/error.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// Mock clients
const mockDeploy = jest.spyOn(SwarmpitClient.prototype, 'deploy')

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'host':
          return 'http://foo.test'
        case 'stack':
          return 'foo-stack'
        case 'api-token':
          return 'test-api-token'
        case 'compose':
          return `${process.cwd()}/__tests__/resources/test-compose.yml`
        case 'client':
          return 'swarmpit'
        case 'action':
          return 'deploy'
        default:
          return ''
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('test client deploy failure', async () => {
    // when
    mockDeploy.mockImplementationOnce(() => {
      throw new ClientError('Mock error', 'foo-client')
    })

    await run()

    // then
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Stack deploy action failed with client error Mock error client: foo-client'
    )
  })

  it('test client success', async () => {
    // when
    mockDeploy.mockImplementationOnce(async () => Promise.resolve())

    await run()

    // then
    expect(mockDeploy).toHaveBeenCalledWith(
      'foo-stack',
      `${process.cwd()}/__tests__/resources/test-compose.yml`
    )

    expect(core.info).toHaveBeenNthCalledWith(
      1,
      'Stack deploy action successful'
    )
  })
})

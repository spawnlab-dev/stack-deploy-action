import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import { ClientError } from '../../src/clients/error.js'
import { FetchError } from 'node-fetch'

// Mock node-fetch response
const mockFetch = jest.fn<typeof fetch>()

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('node-fetch', () => ({
  FetchError: jest.fn(),
  Headers: jest.fn(),
  default: mockFetch
}))

const { SwarmpitClient } = await import('../../src/clients/swarmpit.js')

describe('swarmpit-client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const testComposeFile = `${process.cwd()}/__tests__/resources/test-compose.yml`
  const mockClient = new SwarmpitClient('http://foo.test', 'test-token')

  it('test deploy missing stack', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

    await mockClient.deploy('foo-stack', testComposeFile)

    // make sure the api path correct
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://foo.test/api/stacks',
      expect.anything()
    )

    expect(core.info).toHaveBeenLastCalledWith(
      'Successfully deployed stack foo-stack'
    )
  })

  it('test deploy existing stack', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

    await mockClient.deploy('foo-stack', testComposeFile)

    // make sure the api path correct
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://foo.test/api/stacks/foo-stack',
      expect.anything()
    )

    expect(core.info).toHaveBeenLastCalledWith(
      'Successfully redeployed stack foo-stack'
    )
  })

  it('test delete existing stack', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

    await mockClient.delete('foo-stack')

    // make sure the api path correct
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://foo.test/api/stacks/foo-stack',
      expect.anything()
    )

    expect(core.info).toHaveBeenLastCalledWith(
      'Successfully deleted stack foo-stack'
    )
  })

  it('test delete missing stack', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response)

    await mockClient.delete('foo-stack')

    expect(core.setFailed).toHaveBeenLastCalledWith(
      "Stack deletion failed because foo-stack doesn't exits"
    )
  })

  it('test delete failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

    await mockClient.delete('foo-stack')

    // make sure the api path correct
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://foo.test/api/stacks/foo-stack',
      expect.anything()
    )

    expect(core.setFailed).toHaveBeenLastCalledWith(
      'Stack deletion failed with client response 500'
    )
  })

  it('test deploy failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

    await mockClient.deploy('foo-stack', testComposeFile)

    // make sure the api path correct
    expect(mockFetch).toHaveBeenLastCalledWith(
      'http://foo.test/api/stacks',
      expect.anything()
    )

    expect(core.setFailed).toHaveBeenLastCalledWith(
      'Stack deployment failed with client response 500'
    )
  })

  it('test fetch failure', async () => {
    mockFetch.mockImplementation(() => {
      throw new FetchError('call failed', 'network')
    })

    await expect(
      async () => await mockClient.isPresent('foo-stack')
    ).rejects.toThrow(Error)
  })

  it('test exception deploy', async () => {
    jest
      .spyOn(SwarmpitClient.prototype, 'isPresent')
      .mockImplementationOnce(() => {
        throw new Error('Test client error')
      })

    await expect(
      async () => await mockClient.deploy('foo-stack', testComposeFile)
    ).rejects.toThrow(ClientError)
  })

  it('test exception delete', async () => {
    jest
      .spyOn(SwarmpitClient.prototype, 'isPresent')
      .mockImplementationOnce(() => {
        throw new Error('Test client error')
      })

    await expect(
      async () => await mockClient.delete('foo-stack')
    ).rejects.toThrow(ClientError)
  })
})

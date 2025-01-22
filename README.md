# Docker Stack Deployment Action

[![GitHub Super-Linter](https://github.com/spawnlab-dev/stack-deploy-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/spawnlab-dev/stack-deploy-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/spawnlab-dev/stack-deploy-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/spawnlab-dev/stack-deploy-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/spawnlab-dev/stack-deploy-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/spawnlab-dev/stack-deploy-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Manage docker swarm stacks using various client API e.g
[SwarmpIt](https://swarmpit.io/), [Portainer](https://www.portainer.io/) without
needing of exposing docker manager node over SSH.

## Supported Client's

| Client                                | Status | Supported Actions           | Notes                                                 |
| ------------------------------------- | ------ | --------------------------- | ----------------------------------------------------- |
| [SwarmpIt](https://swarmpit.io/)      | ✅     | [✔] deploy<br> [✔] delete |                                                       |
| [Portainer](https://www.portainer.io) | ✅     | [✔] deploy<br> [✔] delete | refer the [setup guide](#how-to-use-portainer-client) |

### How to use `Portainer` client

Since portainer support multi installations i.e. local, remote, and different
types e.g. k8s, docker compose, swarm etc, So in-order to use the `portainer`
client you need to pass the `swarmId` & `endPointId`. Please follow the below
steps/docs mentioned below to find both required value

- To find the `swarmId` i.e. docker cluster ID, please run the below command in
  docker manager node

```shell
$ docker info | grep "Cluster"
ClusterID: mtoqjoa2xxvXXXrw
```

Use value `mtoqjoa2xxvXXXrw` as "swarmId"

- To find the `endPointId` follow this guide:
  [here](https://tinyurl.com/yc7m7y5v)

## Inputs

| input      | required | default | description                                                         |
| ---------- | -------- | ------- | ------------------------------------------------------------------- |
| host       | **Yes**  | -       | Remote client host fqdn                                             |
| api-token  | **Yes**  | -       | Remote client API/Access token                                      |
| stack      | **Yes**  | -       | Docker swarm stack name to manage                                   |
| client     | **Yes**  | -       | Remote client type `swarmpit` or `portainer`                        |
| action     | **Yes**  | -       | Stack action `delete` or `deploy`                                   |
| compose    | Optional | -       | Docker Compose file, only required if `action` set to `deploy`      |
| endPointId | Optional | -       | Portainer endpoint ID, only required if `client` set to `portainer` |
| swarmId    | Optional | -       | Docker cluster ID, only required if `client` set to `portainer`     |

## Usage

- Deploy stack (if stack already present the action will re-deploy)

  ```yaml
  # Using 'swarmpit' client
  uses: spawnlab-dev/stack-deploy-action@v1
  with:
    host: ${{ secrets.SWARMPIT_HOST}}
    api-token: ${{ secrets.SWARMPIT_API_KEY }}
    stack: action-ci-test
    client: 'swarmpit'
    action: 'deploy'
    compose: 'docker-compose.yml'
  ```

  ```yaml
  # Using 'portainer' client
  uses: spawnlab-dev/stack-deploy-action@v1
  with:
    host: ${{ secrets.PORTAINER_HOST}}
    api-token: ${{ secrets.PORTAINER_API_KEY }}
    swarmId: 'mtoqjoa2xxvXXXrw'
    endPointId: 1
    stack: action-ci-test
    client: 'portainer'
    action: 'deploy'
    compose: 'docker-compose.yml'
  ```

- Delete stack

  ```yaml
  # Using 'swarmpit' client
  uses: spawnlab-dev/stack-deploy-action@v1
  with:
    host: ${{ secrets.SWARMPIT_HOST}}
    api-token: ${{ secrets.SWARMPIT_API_KEY }}
    stack: action-ci-test
    client: 'swarmpit'
    action: 'delete'
  ```

  ```yaml
  # Using 'portainer' client
  uses: spawnlab-dev/stack-deploy-action@v1
  with:
    host: ${{ secrets.PORTAINER_HOST}}
    api-token: ${{ secrets.PORTAINER_API_KEY }}
    swarmId: 'mtoqjoa2xxvXXXrw'
    endPointId: 1
    stack: action-ci-test
    client: 'portainer'
    action: 'delete'
  ```

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

| Client                                | Status | Supported Actions           | Notes                  |
| ------------------------------------- | ------ | --------------------------- | ---------------------- |
| [SwarmpIt](https://swarmpit.io/)      | ✅     | [✔] deploy<br> [✔] delete |                        |
| [Portainer](https://www.portainer.io) | ❌     |                             | will be available soon |

## Inputs

| input     | required | default | description                                                    |
| --------- | -------- | ------- | -------------------------------------------------------------- |
| host      | **Yes**  | -       | Remote client host fqdn                                        |
| api-token | **Yes**  | -       | Remote client API/Access token                                 |
| stack     | **Yes**  | -       | Docker swarm stack name to manage                              |
| client    | **Yes**  | -       | Remote client type `swarmpit` or `portainer`                   |
| action    | **Yes**  | -       | Stack action `delete` or `deploy`                              |
| compose   | Optional | -       | Docker Compose file, only required if `action` set to `deploy` |

## Usage

- Deploy stack (if stack already present the action will re-deploy)

  ```yaml
  uses: spawnlab-dev/stack-deploy-action@v1
  with:
    host: ${{ secrets.SWARMPIT_HOST}}
    api-token: ${{ secrets.SWARMPIT_API_KEY }}
    stack: action-ci-test
    client: 'swarmpit'
    action: 'deploy'
    compose: 'docker-compose.yml'
  ```

- Delete stack

  ```yaml
  uses: spawnlab-dev/stack-deploy-action@v1
  with:
    host: ${{ secrets.SWARMPIT_HOST}}
    api-token: ${{ secrets.SWARMPIT_API_KEY }}
    stack: action-ci-test
    client: 'swarmpit'
    action: 'delete'
  ```

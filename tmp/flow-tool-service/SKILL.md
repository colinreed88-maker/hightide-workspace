---
name: flow-tool-service
description: Manage projects, deployments, databases, cron jobs, teams, policies, service accounts, and access control on the Flow platform via its Tool Service API. Use when asked to create, deploy, update, or tear down Flow platform resources; manage secrets, databases, or Kestra cron flows; handle teams, policies, or service tokens; or query project and deployment status on Flow Tools.
---

# Flow Tool Service

Interact with the Flow Tool Service REST API to manage Flow platform infrastructure.

## Authentication

All requests require a Bearer token. Use the token stored in keychain (or via service account auth).

**Service account auth** (no token required for this call):
```
POST /v1/service-account/authenticate
{ "clientId": "...", "serviceToken": "..." }
→ { "token": "...", "expiresIn": "24h" }
```

Use the returned `token` as `Authorization: Bearer <token>` for all subsequent calls.

## Response Envelope

All responses are wrapped:
```json
{ "header": { "timestamp": "...", "status": 200 }, "payload": { ... } }
```
- Success: `payload` contains the resource object or list
- Errors: `payload.errors` array
- Paginated: `payload.data` + `payload.meta.pagination`

## Core Workflows

### Deploy a project
1. `GET /v1/project` — find the project ID
2. `POST /v1/project/:id/deploy` with `{ "environment": "production", "branch": "main" }`
3. `GET /v1/project/:id/deployments` — check status
4. `GET /v1/deployment/:buildId/timeline` — inspect build progress
5. `GET /v1/deployment/:buildId/log/:logId` — fetch build logs if needed

### Create a project
1. `GET /v1/domain` — get available domain IDs
2. `GET /v1/template` — get template IDs
3. `POST /v1/subdomain/validate` — confirm subdomain is available
4. `POST /v1/project` — create with required fields: `name`, `subdomain`, `domainId`, `templateId`

### Manage secrets
- List: `GET /v1/project/:projectId/secret`
- Create: `POST /v1/project/:projectId/secret`
- Reveal: `GET /v1/project/:projectId/secret/:secretId/reveal`
- Delete: `DELETE /v1/project/:projectId/secret/:secretId`

### Cron job (Kestra flow) operations
- Deploy: `POST /v1/resource/:id/deploy`
- Enable/disable: `POST /v1/resource/:id/enable` or `/disable`
- Trigger now: `POST /v1/resource/:id/execute`
- Check executions: `GET /v1/resource/:id/executions`

## API Reference

See `references/api.md` for the full endpoint reference including all fields, parameters, and response shapes.

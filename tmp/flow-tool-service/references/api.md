# Flow Tool Service — Full API Reference

Base URL: configured per environment (e.g. `https://tool-service.apps-and-services.com`)

All endpoints require `Authorization: Bearer <token>` unless noted.

## Table of Contents
1. [Persons](#persons)
2. [Projects](#projects)
3. [Project Secrets](#project-secrets)
4. [Deployments](#deployments)
5. [Domains & Subdomains](#domains--subdomains)
6. [Templates](#templates)
7. [Tags & FAQs](#tags--faqs)
8. [Resources (DB + Cron)](#resources)
9. [Resource Instances](#resource-instances)
10. [Teams](#teams)
11. [Policies](#policies)
12. [Project Policies](#project-policies)
13. [Service Tokens](#service-tokens)
14. [Service Accounts](#service-accounts)
15. [Tenants & Environments](#tenants--environments)
16. [MCP Clients](#mcp-clients)
17. [Permissions Pattern](#permissions-pattern)

---

## Persons

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/person/resolve` | Create/update person from JWT claims. Returns `{ id, email, name }` |
| GET | `/v1/person/auth-check` | Returns raw JWT payload |
| GET | `/v1/person/me` | Returns current person or 404 |
| GET | `/v1/person/search?q=<query>` | Search by name/email (min 2 chars). Paginated |

---

## Projects

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/project` | Create project |
| GET | `/v1/project` | List user's projects (paginated) |
| GET | `/v1/project/gallery` | List gallery projects (paginated) |
| GET | `/v1/project/github-config` | Returns `{ enabled, org }` |
| GET | `/v1/project/:id` | Get project or 404 |
| PUT | `/v1/project/:id` | Update project. Setting `status: "archived"` tears down all deployments |
| POST | `/v1/project/:id/deploy` | Deploy to an environment |
| POST | `/v1/project/:id/provision` | Re-run template provisioning |
| GET | `/v1/project/:id/deployments` | List deployments (paginated) |

**Create project fields:**

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| name | string | Yes | |
| subdomain | string | Yes | lowercase alphanumeric + hyphens |
| domainId | number | Yes | |
| templateId | number | Yes | |
| description | string | No | |
| repoUrl | string | No | Git SSH URL |
| fieldValues | array | No | `[{ name, value }]` |
| repoPathToBuild | string | No | |

**Deploy fields:**

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| environment | string | Yes | `"production"`, `"test"`, or `"branch"` |
| branch | string | No | Default: `"main"` |
| expiresAt | string | Cond | ISO 8601. Required for `"branch"`. Max 7 days |
| secretsEnvironment | string | Cond | `"production"` or `"test"`. Required for `"branch"` |

---

## Project Secrets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/project/:projectId/secret/can-manage` | Returns `{ canManage: bool }` |
| GET | `/v1/project/:projectId/secret` | List secrets (values hidden) |
| GET | `/v1/project/:projectId/secret/:secretId/reveal` | Reveal secret value |
| POST | `/v1/project/:projectId/secret` | Create secret |
| PUT | `/v1/project/:projectId/secret/:secretId` | Update secret |
| DELETE | `/v1/project/:projectId/secret/:secretId` | Delete. Returns `{ deleted: true }` |

**Create/update secret fields:**

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| name | string | Yes | Human-readable |
| envVarName | string | Yes | Letters, numbers, underscores |
| environment | string | Yes | `"production"` or `"test"` |
| value | string | Yes | |
| isSecret | boolean | No | Default: false |
| canShow | boolean | No | Default: false |

---

## Deployments

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/deployment/:id/teardown` | Teardown a deployment. Returns `{ success: bool }` |
| GET | `/v1/deployment/:buildId/timeline` | Azure DevOps build timeline |
| GET | `/v1/deployment/:buildId/log/:logId?startLine=N` | Build log lines |

---

## Domains & Subdomains

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/domain` | List active domains |
| POST | `/v1/subdomain/validate` | Check availability. Body: `{ subdomain, domainId }`. Returns `{ available: bool }` |

---

## Templates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/template` | List templates (paginated) |
| GET | `/v1/template/:id` | Get template or 404 |

---

## Tags & FAQs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/tag?tagType=<type>` | List tags |
| GET | `/v1/faq` | List FAQs (paginated, default pageSize 100) |

---

## Resources

Manages PostgreSQL databases (`POSTGRES_DB`) and Kestra cron flows (`CRON`).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/resource` | Create resource |
| GET | `/v1/resource` | List resources (paginated) |
| GET | `/v1/resource/by-project/:projectId` | List for a project |
| GET | `/v1/resource/by-resource-id/:resourceId` | Get by resource ID |
| GET | `/v1/resource/:id` | Get or 404 |
| PUT | `/v1/resource/:id` | Update (owner only) |
| DELETE | `/v1/resource/:id` | Delete (owner only). Returns `{ deleted: true }` |

**Create resource fields:**

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| name | string | Yes | |
| resourceType | string | Yes | `"CRON"` or `"POSTGRES_DB"` |
| resource | object | No | Resource-specific config |
| projectId | number | No | |
| environmentId | number | No | |

**Update fields:** `name`, `resource`, `status` (`"active"` or `"inactive"`)

### Kestra (CRON) Operations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/resource/:id/deploy` | Deploy flow |
| GET | `/v1/resource/:id/deployments` | List deployments |
| GET | `/v1/resource/:id/executions?page=&size=` | List executions |
| GET | `/v1/resource/:id/executions/:executionId/logs` | Execution logs |
| GET | `/v1/resource/:id/flow-status` | Flow status |
| POST | `/v1/resource/:id/disable` | Disable flow |
| POST | `/v1/resource/:id/enable` | Enable flow |
| POST | `/v1/resource/:id/execute` | Trigger immediate execution |

### Database (POSTGRES_DB) Operations

Environment param must be `"production"` or `"test"`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/resource/:id/provision/:environment` | Provision database |
| POST | `/v1/resource/:id/rotate-password/:environment` | Rotate primary password |
| GET | `/v1/resource/:id/db-password/:environment?userId=` | Get password (omit userId for primary) |
| POST | `/v1/resource/:id/rotate-password/:environment/:userId` | Rotate user password |
| POST | `/v1/resource/:id/db-user/:environment` | Add DB user: `{ username, role, friendlyName }` |

DB user roles: `"owner"`, `"readwrite"`, `"readonly"`

---

## Resource Instances

Manage infrastructure (PostgreSQL servers, Kestra instances).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/resource-instance` | Create instance |
| GET | `/v1/resource-instance` | List instances |
| PUT | `/v1/resource-instance/:id` | Update |
| DELETE | `/v1/resource-instance/:id` | Delete. Returns `{ deleted: true }` |

**Create fields:** `name`, `type` (`"DATABASE"` or `"CRON"`), `infrastructure` (`"KESTRA"` or `"POSTGRES"`), `location`, `resourceKey`, `defaultPort`, `environmentId`

**List params:** `type`, `status` (`"DEPLOYABLE"`, `"FULL"`, `"OFFLINE"`), `environmentId`

---

## Teams

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/team` | Create: `{ name, description?, emails? }` |
| GET | `/v1/team` | List user's teams |
| GET | `/v1/team/:id` | Get or 404 |
| PUT | `/v1/team/:id` | Update (owner): `name`, `description` |
| DELETE | `/v1/team/:id` | Delete (owner). Returns `{ deleted: true }` |
| GET | `/v1/team/:id/members` | List members |
| POST | `/v1/team/:id/members` | Add members: `{ emails: [...] }` |
| DELETE | `/v1/team/:id/members` | Remove members: `{ emails: [...] }` |

---

## Policies

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/policy` | Create policy |
| GET | `/v1/policy` | List user's policies |
| GET | `/v1/policy/:id` | Get or 404 |
| PUT | `/v1/policy/:id` | Update (owner) |
| DELETE | `/v1/policy/:id` | Delete (owner). Returns `{ deleted: true }` |

**Create fields:**

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| name | string | Yes | |
| decision | string | Yes | `"allow"`, `"block"`, `"bypass"`, `"service_auth"` |
| description | string | No | |
| teamIds | number[] | No | |
| serviceTokenId | number | No | Required for `"service_auth"` |

---

## Project Policies

Bind policies to projects in specific environments.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/project-policy` | Create: `{ projectId, policyId, environmentId }` |
| GET | `/v1/project-policy/by-project/:projectId` | List by project |
| GET | `/v1/project-policy/by-policy/:policyId` | List by policy |
| GET | `/v1/project-policy/:id` | Get or 404 |
| PUT | `/v1/project-policy/:id` | Update: `{ environmentId }` |
| DELETE | `/v1/project-policy/:id` | Delete. Returns `{ deleted: true }` |

---

## Service Tokens

Machine-to-machine auth tokens used in policies.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/service-token` | Create: `{ name, duration: "365d" }`. Returns `clientSecret` (shown once) |
| GET | `/v1/service-token` | List tokens |
| GET | `/v1/service-token/:id` | Get or 404 |
| DELETE | `/v1/service-token/:id` | Delete (owner). Returns `{ deleted: true }` |

---

## Service Accounts

Programmatic API access for bots/automation.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/service-account/authenticate` | **No auth.** Body: `{ clientId, serviceToken }`. Returns JWT |
| POST | `/v1/service-account` | Create: `{ name }`. Returns `clientId` + `serviceToken` (shown once) |
| GET | `/v1/service-account` | List user's accounts |
| GET | `/v1/service-account/:id` | Get or 404 |
| GET | `/v1/service-account/:id/reveal-token` | Reveal `serviceToken` and `clientId` |
| DELETE | `/v1/service-account/:id` | Delete (owner). Returns `{ deleted: true }` |

---

## Tenants & Environments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/tenant` | List tenants |
| GET | `/v1/tenant/:id` | Get or 404 |
| POST | `/v1/tenant` | Create: `{ name }` |
| GET | `/v1/environment?tenantId=` | List environments |
| GET | `/v1/environment/:id` | Get or 404 |
| POST | `/v1/environment` | Create environment |
| PUT | `/v1/environment/:id` | Update |

**Create environment fields:** `name`, `environment` (`"production"` or `"test"`), `hostingProvider` (`"AZURE"`), `hostingProviderId`, `tenantId`, `label?`, `environmentCode?`

---

## MCP Clients

No authentication required.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/mcp-client/:clientId` | Get client data or 404 |
| POST | `/v1/mcp-client` | Register/update: `{ clientId, clientData: {...} }` |

---

## Permissions Pattern

Projects, resources, teams, policies, and service tokens all share these sub-endpoints. Replace `{ENTITY_PATH}` with e.g. `project/:projectId`, `resource/:resourceId`, etc.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/{ENTITY_PATH}/permission` | List permissions |
| POST | `/v1/{ENTITY_PATH}/permission` | Add: `{ personId: number, role: "owner"\|"contributor"\|"viewer" }` |
| DELETE | `/v1/{ENTITY_PATH}/permission/:permissionId` | Remove (cannot remove last owner) |

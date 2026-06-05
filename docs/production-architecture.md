# Myra AI Assistant Platform Production Architecture

This plan prepares Myra for real business tenants without changing current product behavior. The current checkout owns the Admin UI and Widget; backend implementation targets below belong in the Aro/Myra backend services repository.

## Architecture Diagram

```text
Business website
  |
  | loads widget bundle
  v
Myra Widget
  | X-API-Key, X-Tenant-Id, X-Request-Id
  v
API Gateway / Reverse Proxy
  |-- /api/v1/tenants/*   -> tenant-service
  |-- /api/v1/chat/*      -> chat-service
  |-- /api/v1/knowledge/* -> knowledge-service
  |-- /api/v1/leads/*     -> lead-service
  |-- /api/v1/analytics/* -> analytics-service
  |
  | central middleware:
  | CORS, request IDs, security headers, rate limits,
  | auth boundary, structured logs, metrics, health aggregation
  v
Backend services
  | use shared/
  | config, DB, responses, exceptions, logging, idempotency, HTTP clients
  v
Postgres + Redis + Object Storage + Queue/Workers

Admin UI
  | JWT or admin secret through gateway
  v
API Gateway / Reverse Proxy
```

## Target Folder Structure

```text
backend/
  gateway/
    main.py
    routes.py
    middleware/
      cors.py
      request_id.py
      rate_limit.py
      security_headers.py
      metrics.py
      health.py
  shared/
    __init__.py
    config_base.py
    db_utils.py
    api_response.py
    exceptions_base.py
    logging_utils.py
    idempotency_base.py
    http_client.py
  tenant-service/
    app/
    migrations/
    openapi.yaml
  chat-service/
    app/
    migrations/
    openapi.yaml
  knowledge-service/
    app/
    migrations/
    workers/
    openapi.yaml
  lead-service/
    app/
    migrations/
    openapi.yaml
  analytics-service/
    app/
    migrations/
    openapi.yaml
  contracts/
    myra-platform.contract.json
    contract-tests/

frontend/
  myra-admin-ui/
  myra-widget/
  contracts/
    myra-platform.contract.json
```

## Gateway Responsibilities

- Route only versioned backend traffic under `/api/v1`.
- Generate `X-Request-Id` when absent and forward it to every service.
- Apply CORS once at the edge from an environment allowlist.
- Apply security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS in production.
- Enforce rate limits before service work:
  - chat: tenant plus IP scoped
  - leads: tenant plus IP scoped
  - knowledge uploads: tenant/admin scoped
- Expose `GET /health` for gateway health and `GET /api/v1/health` for aggregate service health.
- Expose `GET /metrics` with gateway metrics and proxy upstream metrics separately.

## Shared Backend Library

Create `shared/` and migrate duplicate service code into:

- `config_base.py`: env parsing, required production settings, CORS parsing, Redis/object-storage requirements.
- `db_utils.py`: normalized database URLs, async pool creation, migration guards.
- `api_response.py`: standard `success/data/message` and error envelope helpers.
- `exceptions_base.py`: canonical exception classes and status mapping.
- `logging_utils.py`: JSON logs, request ID binding, privacy redaction.
- `idempotency_base.py`: Redis-backed idempotency keys and replay behavior.
- `http_client.py`: service-to-service timeouts, retries, circuit breakers, request ID propagation, OpenTelemetry hooks.

Services should import shared modules instead of maintaining local copies of database URL normalization, CORS parsing, response envelopes, DB pool config, idempotency helpers, or HTTP client retry logic.

## Shared API Contract

Canonical contract file in this workspace:

```text
contracts/myra-platform.contract.json
```

Canonical fields:

- Chat response: `data.reply`
- Transitional chat fallback: `data.assistant_message`
- Lead request: `phone`, `message`, default `lead_type: "GENERAL"`
- Forbidden lead fields: `mobile`, `interest`
- Tenant public config: camelCase
- Admin tenant API payloads: snake_case
- Response styles: `PROFESSIONAL`, `FRIENDLY`, `CASUAL`, `FORMAL`

Each backend service should publish generated OpenAPI:

```text
tenant-service/openapi.yaml
chat-service/openapi.yaml
knowledge-service/openapi.yaml
lead-service/openapi.yaml
analytics-service/openapi.yaml
gateway/openapi.yaml
```

Contract tests should run in both directions:

- Backend validates OpenAPI against `contracts/myra-platform.contract.json`.
- Admin UI validates tenant transformers, lead test payloads, and gateway routes against the shared contract.
- Widget validates chat and lead client payloads against the shared contract.

## Deployment Plan

1. Add gateway in front of existing services with route parity.
2. Keep direct service URLs available for development while Admin UI and Widget move to gateway defaults.
3. Add request IDs, CORS, security headers, and logs at gateway first.
4. Extract `shared/` module one service at a time.
5. Add Redis tenant config cache and idempotency store.
6. Move knowledge ingestion and embeddings to background workers.
7. Add metrics endpoints and health aggregation.
8. Enforce production startup checks:
   - migrations completed
   - no mock providers enabled
   - no default secrets
   - Redis configured
   - object storage configured
9. Enable circuit breakers for service-to-service calls.
10. Remove transitional chat `assistant_message` fallback after backend guarantees `data.reply`.

## Compatibility Notes

- Product behavior remains unchanged during the gateway introduction.
- Existing UI forms keep camelCase values internally.
- Backend-facing Admin UI payloads remain snake_case.
- Widget continues supporting service-specific URLs for split-service deployments.
- Widget temporarily accepts `data.assistant_message`, but the canonical response is `data.reply`.
- Existing tenant IDs, API keys, session IDs, and embed scripts remain valid.

## Files Changed In This Workspace

- `contracts/myra-platform.contract.json`
- `docs/production-architecture.md`
- `package.json`
- `README.md`
- `myra-admin-ui/src/contracts/platformContract.test.ts`
- `myra-widget/src/contracts/platformContract.test.ts`

Previously aligned contract files remain part of the same hardening line:

- `myra-admin-ui/.env.example`
- `myra-admin-ui/README.md`
- `myra-admin-ui/src/api/leadApi.ts`
- `myra-admin-ui/src/features/tenants/tenant.transformers.ts`
- `myra-widget/src/api/myraClient.ts`
- `myra-widget/src/types/myra.types.ts`
- `myra-widget/docs/api.md`
- `myra-widget/docs/openapi.yaml`

## Backend Migration Checklist

- Add gateway service and route table.
- Add shared library modules.
- Replace duplicated service helpers with shared imports.
- Generate OpenAPI for each service during CI.
- Add contract tests in backend CI.
- Add Redis for tenant config cache.
- Add Redis idempotency store.
- Add object storage for knowledge documents.
- Add queue and workers for document ingestion and embedding.
- Add JSON log configuration.
- Add metrics endpoint to each service.
- Add aggregate health endpoint at gateway.
- Add production startup checks for migrations, secrets, Redis, object storage, and mock providers.

## Test Commands

```bash
npm run test:contracts
npm --prefix myra-admin-ui run lint
npm --prefix myra-admin-ui run test
npm --prefix myra-admin-ui run build
npm --prefix myra-widget run lint
npm --prefix myra-widget run test
npm --prefix myra-widget run build
```

Backend target commands:

```bash
pytest
pytest contracts/
alembic upgrade head
python -m gateway.main
```

## Deployment Checklist

- `DATABASE_URL` set for every service.
- `REDIS_URL` set in production.
- Object storage bucket and credentials set for knowledge service.
- No default API keys, admin secrets, JWT secrets, or encryption keys.
- Migrations run before each service starts.
- Gateway CORS allowlist set to production domains.
- Rate limits enabled for chat, lead, and knowledge endpoints.
- `X-Request-Id` present in gateway logs and all downstream service logs.
- `/health`, `/api/v1/health`, and `/metrics` reachable.
- OpenTelemetry exporter configured or explicitly disabled.
- Mock providers disabled.
- Admin UI and Widget configured to gateway URLs.
- Contract tests pass against deployed OpenAPI.

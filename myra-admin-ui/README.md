# Myra Admin UI

Production-ready React + TypeScript + Vite admin portal for the Myra AI SaaS platform.

## Stack

- React, TypeScript, Vite
- Tailwind CSS with shadcn-style reusable UI primitives
- React Router protected routes
- TanStack React Query for server state
- Axios centralized API client
- Zustand persisted auth store
- React Hook Form + Zod validation
- Lucide React icons
- Vitest + React Testing Library
- ESLint + Prettier + Husky pre-commit checks

## Setup

```bash
cd myra-admin-ui
npm install
cp .env.example .env
npm run dev
```

The app defaults to:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_TENANT_API_URL=http://localhost:8000/api/v1
VITE_KNOWLEDGE_API_URL=http://localhost:8002/api/knowledge
VITE_CHAT_API_URL=http://localhost:8003/api/chat
VITE_LEAD_API_URL=http://localhost:8004/api/leads
VITE_ANALYTICS_API_URL=http://localhost:8005/api/analytics
VITE_ADMIN_API_URL=http://localhost:8006/api/admin
VITE_ADMIN_SECRET=local-dev-admin-secret
```

Open the Vite URL shown in the terminal. The configured dev port is `5174`.

## Login

Use any valid email and a password with at least 6 characters. If the backend gateway is unavailable, the login flow automatically uses a local demo session so the portal can be explored during development.

Example:

```text
admin@myra.ai
password123
```

## Routes

- `/login`
- `/dashboard`
- `/tenants`
- `/tenants/new`
- `/tenants/:tenantId`
- `/knowledge`
- `/widget/:tenantId`
- `/conversations`
- `/leads`
- `/analytics`
- `/settings`

## API Behavior

Production can use either a backend gateway or service-specific URLs. The admin portal validates these variables through `src/config/env.ts`:

```bash
VITE_API_BASE_URL=https://YOUR-GATEWAY/api/v1
VITE_TENANT_API_URL=https://YOUR-GATEWAY/api/v1
VITE_KNOWLEDGE_API_URL=https://YOUR-KNOWLEDGE-SERVICE/api/knowledge
VITE_CHAT_API_URL=https://YOUR-CHAT-SERVICE/api/chat
VITE_LEAD_API_URL=https://YOUR-LEAD-SERVICE/api/leads
VITE_ANALYTICS_API_URL=https://YOUR-ANALYTICS-SERVICE/api/analytics
VITE_ADMIN_API_URL=https://YOUR-ADMIN-SERVICE/api/admin
VITE_ADMIN_SECRET=your-admin-secret
```

Direct service access is useful for local development and split-service deployments. Leave the service URLs pointed at the gateway when everything is served behind one domain.

All admin backend calls go through `src/lib/apiClient.ts`, which:

- Reads `VITE_API_BASE_URL`
- Uses configurable request timeout and retry values
- Retries transient network, rate-limit, and server failures with exponential backoff
- Attaches JWT, optional widget API key, and CSRF headers
- Attempts token refresh on `401` before logging out
- Normalizes network, timeout, validation, auth, rate-limit, and server errors
- Adds structured API request/response logging
- Lets feature APIs fall back to local demo data when the backend is unavailable

Expected services behind the gateway:

- tenant-service
- auth-service
- knowledge-service
- chat-service
- lead-service
- analytics-service
- widget-config-service
- gateway-service

See:

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Authentication](docs/authentication.md)
- [Deployment](docs/deployment.md)
- [Components](docs/components.md)
- [Translation Process](docs/i18n.md)

## Environment Configuration

Copy the right example for the target environment:

```bash
cp .env.development.example .env
cp .env.staging.example .env
cp .env.production.example .env
```

`src/lib/config.ts` validates environment variables at startup. Production and any environment with `VITE_REQUIRE_ENV_VALIDATION=true` fail fast when required values are invalid.

Key variables:

- `VITE_API_BASE_URL`: gateway `/api/v1` base URL
- `VITE_TENANT_API_URL`: tenant API base URL
- `VITE_KNOWLEDGE_API_URL`: knowledge API base URL
- `VITE_CHAT_API_URL`: chat API base URL
- `VITE_LEAD_API_URL`: lead API base URL
- `VITE_ANALYTICS_API_URL`: analytics API base URL
- `VITE_ADMIN_API_URL`: admin API base URL
- `VITE_ADMIN_SECRET`: admin service secret sent to admin endpoints
- `VITE_API_TIMEOUT_MS`: request timeout, default `12000`
- `VITE_API_RETRY_ATTEMPTS`: transient retry attempts, default `2`
- `VITE_API_RETRY_BASE_DELAY_MS`: exponential backoff base delay, default `300`
- `VITE_API_RATE_LIMIT_PER_MINUTE`: defensive frontend throttle, default `120`
- `VITE_PUBLIC_WIDGET_KEY`: optional widget API key sent as `X-Api-Key`
- `VITE_SENTRY_DSN`: optional production error tracking DSN

## Testing And Quality

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run format:check
```

Current coverage includes API client behavior, shared status badges, and the login flow. Add focused component tests next to components and broader flow tests under `src/test/integration`.

## Security Notes

The frontend implements client-side request throttling, CSRF header forwarding, payload sanitization, token refresh handling, and route-level error recovery. The backend gateway must still enforce server-side rate limiting, issue secure httpOnly refresh cookies, validate CSRF tokens, restrict widget API keys to public widget endpoints, and store audit logs.

## Accessibility

Forms should use visible labels and field-level error text. Interactive elements use visible focus styles from the shared UI primitives. When adding new flows, verify keyboard navigation, dialog focus behavior, and screen-reader labels with React Testing Library and manual browser checks.

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`.

## Deploy To Netlify

This repository includes a root `netlify.toml` configured for the admin app:

```toml
[build]
  base = "myra-admin-ui"
  command = "npm run build"
  publish = "dist"
```

In Netlify, create a new site from this repository and use these settings:

- Base directory: `myra-admin-ui`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

Add this environment variable in Netlify:

```bash
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
```

Replace `YOUR-RENDER-SERVICE` with the deployed Render backend service name. Vite reads this value at build time, so redeploy the Netlify site after changing it.

## Render Backend Notes

Your Render backend should expose the API under `/api/v1`, matching:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/v1
```

Also configure CORS on the backend to allow your Netlify origin:

```text
https://YOUR-NETLIFY-SITE.netlify.app
```

Add your custom domain too if you connect one later.

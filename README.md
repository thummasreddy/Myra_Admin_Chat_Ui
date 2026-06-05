# Myra Admin Chat UI

Frontend workspace for the Myra AI SaaS admin portal and embeddable chat widget.

## Applications

- `myra-admin-ui`: React + TypeScript admin/customer portal built with Vite.
- `myra-widget`: embeddable public chatbot widget.

## Backend Architecture

Myra should use a backend gateway in production. The frontend talks to the gateway instead of each service owning CORS, security headers, rate limits, and cross-service routing independently:

- `/api/v1/tenants/*` -> tenant-service
- `/api/v1/chat/*` -> chat-service
- `/api/v1/knowledge/*` -> knowledge-service
- `/api/v1/leads/*` -> lead-service
- `/api/v1/analytics/*` -> analytics-service

The canonical platform contract lives in `contracts/myra-platform.contract.json`. The production architecture, migration plan, compatibility notes, and deployment checklist are in [docs/production-architecture.md](docs/production-architecture.md).

The Admin UI and Widget still support direct service URLs for local split-service development.

## Common Commands

```bash
npm install --prefix myra-admin-ui
npm run dev
npm run build
npm run lint
npm run test
npm run test:contracts
```

The admin app defaults to Vite port `5174`.

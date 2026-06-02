# Deployment Guide

## Development

```bash
cd myra-admin-ui
cp .env.development.example .env
npm install
npm run dev
```

## Staging

Use `.env.staging.example` as the source of required variables. Staging should use the gateway and should set `VITE_REQUIRE_ENV_VALIDATION=true` so invalid URLs fail at startup.

## Production

Use `.env.production.example` as the source of required variables:

```bash
VITE_API_BASE_URL=https://YOUR-GATEWAY-SERVICE.onrender.com/api/v1
VITE_ENABLE_DEMO_FALLBACKS=false
VITE_REQUIRE_ENV_VALIDATION=true
```

For Netlify, keep:

- Base directory: `myra-admin-ui`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

The gateway must allow the deployed frontend origin in CORS and must expose `/api/v1/*`, `/api/chat`, and `/api/leads`.

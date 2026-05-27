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

All backend calls go through `src/lib/apiClient.ts`, which:

- Reads `VITE_API_BASE_URL`
- Attaches the persisted JWT token
- Clears auth and redirects to `/login` on `401`
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

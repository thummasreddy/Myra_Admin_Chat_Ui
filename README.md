# Myra Admin Chat UI

Frontend workspace for the Myra AI SaaS admin portal and embeddable chat widget.

## Applications

- `myra-admin-ui`: React + TypeScript admin/customer portal built with Vite.
- `myra-widget`: embeddable public chatbot widget.

## Backend Architecture

Myra should use a backend gateway in production. The frontend talks to the gateway instead of calling each service directly:

- Admin portal: `VITE_API_BASE_URL=https://gateway.example.com/api/v1`
- Widget public endpoints: `https://gateway.example.com/api/chat` and `https://gateway.example.com/api/leads`

Direct service URLs are supported only as local development overrides in `myra-admin-ui/.env.example`.

See [architecture](myra-admin-ui/docs/architecture.md) for the routing diagram and service responsibilities.

## Common Commands

```bash
npm install --prefix myra-admin-ui
npm run dev
npm run build
npm run lint
npm run test
```

The admin app defaults to Vite port `5174`.

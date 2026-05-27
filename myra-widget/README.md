# Myra Chat Widget

Reusable React + TypeScript chat widget for the Myra platform.

This widget is currently wired for the backend services in this monorepo:
- `tenant-service` (port `8000`)
- `chat-service` (port `8003`)
- `lead-service` (port `8004`)

## What This Demo Uses

- UI dev server: `http://localhost:5173`
- Chat API from UI: `/api/chat/message` (proxied to `http://localhost:8003`)
- Lead API from UI: `/api/leads` (proxied to `http://localhost:8004`)

## Prerequisites

- Node.js 18+
- Docker Desktop
- Backend repo root:
  `D:\Projects\myra\Aro-ai-platform.git\Aro-ai-platform`

## 1) Start Backend Services

From repo root:

```powershell
cd D:\Projects\myra\Aro-ai-platform.git\Aro-ai-platform
docker compose up --build -d
docker compose ps
```

Expected containers up:
- `myra-postgres`
- `myra-redis`
- `myra-tenant-service`
- `myra-knowledge-service`
- `myra-chat-service`
- `myra-lead-service`
- `myra-analytics-service`

## 2) Create Tenant `vthumma` (One-Time)

If tenant already exists, skip.

```powershell
$headers = @{
  'X-Admin-Secret' = 'change-me-admin-secret'
  'Content-Type'   = 'application/json'
}

$body = @{
  tenant_id          = 'vthumma'
  tenant_name        = 'Vijay Thumma Portfolio'
  assistant_name     = 'Myra'
  assistant_intro    = 'Myra is Vijay''s AI career and technology assistant.'
  brand_color        = '#2563EB'
  fallback_message   = 'I can help with Vijay''s profile and projects.'
  status             = 'ACTIVE'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/api/v1/tenants' -Headers $headers -Body $body
```

Optional check:

```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:8000/api/v1/tenants/public/vthumma'
```

## 3) Run Widget UI

```powershell
cd D:\Projects\myra\Aro-ai-platform.git\Aro-ai-platform\myra-widget
npm install
npm run dev -- --host=0.0.0.0 --port=5173
```

Open: `http://localhost:5173`

## 4) Test Chatbot From UI

1. Open widget launcher.
2. Submit lead form.
3. Send chat message.
4. Confirm assistant response appears in chat.

## 5) Verify Data Was Stored

### Check leads

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8004/api/leads?tenant_id=vthumma&page=1&size=20" | ConvertTo-Json -Depth 10
```

### Check chat sessions

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8003/api/chat/sessions?tenant_id=vthumma&page=1&size=20" | ConvertTo-Json -Depth 10
```

### Check messages for one session

```powershell
# replace <session_id> with value from sessions response
Invoke-RestMethod -Method Get -Uri "http://localhost:8003/api/chat/sessions/<session_id>/messages?tenant_id=vthumma" | ConvertTo-Json -Depth 10
```

## Widget Usage in React

```tsx
import { MyraChatWidget } from '@myra/chat-widget';

export default function App() {
  return (
    <MyraChatWidget
      tenantId="vthumma"
      apiBaseUrl="http://localhost:5173"
      chatServiceUrl="/api/chat"
      leadServiceUrl="/api/leads"
      apiKey="dev-key"
      assistantName="Myra"
      brandColor="#2563eb"
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tenantId` | `string` | Yes | Tenant ID sent to backend |
| `apiBaseUrl` | `string` | Yes | Base URL for widget API construction |
| `apiKey` | `string` | Yes | Sent as `X-API-Key` header |
| `chatServiceUrl` | `string` | No | Override chat base path (default: `${apiBaseUrl}/api/chat`) |
| `leadServiceUrl` | `string` | No | Override lead base path (default: `${apiBaseUrl}/api/leads`) |
| `assistantName` | `string` | No | Assistant display name |
| `brandColor` | `string` | No | Primary accent color |
| `ownerName` | `string` | No | Owner name shown in widget copy |
| `questionSections` | `QuestionSection[]` | No | Suggested prompt sections |
| `position` | `"bottom-right" \| "bottom-left"` | No | Launcher position |

## Notes

- This README reflects the current backend contract in this repo.
- The widget adapter maps backend response envelopes to widget response types.
- Vite proxy in `vite.config.ts` handles `/api/chat` and `/api/leads` during local development.

# API Reference

The admin app calls `VITE_API_BASE_URL`, which should point to the gateway `/api/v1` prefix.

## Admin Endpoints

| Area | Method | Path | Purpose |
| --- | --- | --- | --- |
| Auth | `POST` | `/auth/login` | Exchange credentials for an access token and user profile. |
| Auth | `POST` | `/auth/refresh` | Refresh an expired access token using a secure refresh cookie. |
| Tenants | `GET` | `/tenants` | List tenants. |
| Tenants | `POST` | `/tenants` | Create a tenant. |
| Tenants | `GET` | `/tenants/:tenantId` | Fetch tenant details. |
| Knowledge | `GET` | `/knowledge` | List knowledge documents. |
| Knowledge | `POST` | `/knowledge` | Upload or register a knowledge document. |
| Analytics | `GET` | `/analytics/*` | Fetch dashboard and tenant analytics. |
| Leads | `GET` | `/leads` | List captured leads for admin/customer dashboards. |
| Widget | `GET` | `/widget/:tenantId` | Fetch widget configuration. |
| Widget | `PUT` | `/widget/:tenantId` | Update widget configuration. |

## Public Widget Endpoints

These endpoints are intentionally outside `/api/v1` for lightweight public embed compatibility:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/chat` | Send a visitor message and receive an assistant response. |
| `POST` | `/api/leads` | Capture a visitor lead from the widget. |

## Error Shape

Preferred backend error response:

```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email"
  }
}
```

The frontend normalizes errors into `MyraApiError` with one of these kinds: `network`, `timeout`, `validation`, `auth`, `rate_limited`, `server`, or `unknown`.

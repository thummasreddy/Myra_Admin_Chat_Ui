---
name: testing-myra-admin-ui
description: Test the Myra Admin UI end-to-end against a local backend. Use when verifying admin dashboard, tenant management, approvals, or authentication changes.
---

# Testing Myra Admin UI

## Prerequisites

### Backend Setup
1. The backend lives in the `Aro-ai-platform` repo. Start all services with:
   ```bash
   cd /home/ubuntu/repos/Aro-ai-platform
   docker compose up -d --build
   ```
2. Wait for all services to be healthy: `docker compose ps` — expect postgres, redis, api-gateway, tenant-service, analytics-service, chat-service, knowledge-service, lead-service, business-action-service all showing "healthy" or "running".
3. The API gateway runs on `http://localhost:8080`.

### Create Admin User
The admin user might not exist yet. Create one via the tenant-service container:
```bash
docker compose exec tenant-service python -c "
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.core.enums import UserRole
import uuid

db = SessionLocal()
existing = db.query(User).filter(User.email == 'admin@myra.ai').first()
if not existing:
    admin = User(
        id=uuid.uuid4(),
        email='admin@myra.ai',
        password_hash=hash_password('Admin123!'),
        role=UserRole.MYRA_SUPER_ADMIN,
        full_name='Myra Admin',
        is_active=True
    )
    db.add(admin)
    db.commit()
    print('Admin created')
else:
    print('Admin already exists')
db.close()
"
```

### Create Test Tenants (Optional)
For testing tenant list/detail/approvals, seed test tenants via the onboarding API:
```bash
curl -s -X POST http://localhost:8080/api/v1/onboarding/register \
  -H 'Content-Type: application/json' \
  -d '{"business_name":"Acme Corp","slug":"acme-corp","owner_email":"owner@acme-corp.com","owner_full_name":"Acme Owner","category":"Technology","website":"https://acme-corp.com/","phone":"+1234567890","description":"Leading technology solutions"}'

curl -s -X POST http://localhost:8080/api/v1/onboarding/register \
  -H 'Content-Type: application/json' \
  -d '{"business_name":"Beta Solutions","slug":"beta-solutions","owner_email":"owner@beta-solutions.com","owner_full_name":"Beta Owner","category":"Healthcare","website":"https://beta-solutions.com/","phone":"+9876543210","description":"Healthcare innovation"}'
```

To set a tenant to PENDING_REVIEW for approvals testing:
```bash
docker compose exec postgres psql -U myra_tenant_user -d myra_tenant_db \
  -c "UPDATE tenants SET approval_status = 'PENDING_REVIEW' WHERE slug = 'acme-corp';"
```

### Frontend Setup
```bash
cd /home/ubuntu/repos/Myra-Admin-Chat-Ui/myra-admin-ui
npm install
npm run dev
```
The dev server runs on `http://localhost:5174`. Ensure `.env.development` has:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Test Credentials
- **Admin login**: email=`admin@myra.ai`, password=`Admin123!`
- **Login URL**: `http://localhost:5174/myra-admin/login`

## Key Pages and Routes
| Page | Route | What to verify |
|------|-------|---------------|
| Login | `/myra-admin/login` | Redirects to /dashboard on success |
| Dashboard | `/dashboard` | Real metrics (total_tenants, pending_approvals, etc.) |
| Tenants | `/tenants` | Lists real tenants from DB, not mock data |
| Tenant Detail | `/tenants/:id` | Shows business profile, owner details, feature flags |
| Approvals | `/approvals` | Filters to PENDING_REVIEW tenants only |
| Subscriptions | `/subscriptions` | Subscription plan management |

## Common Issues

### Login succeeds but doesn't redirect
The `auth.api.ts` login function might not properly unwrap the backend's `{ success, data }` response envelope. The backend returns `{ success: true, data: { access_token, user } }`. If the login function uses raw `axios.post()` instead of `createApiClient()`, it misses the response interceptor. Check that `normalizeLoginResponse()` receives unwrapped data with `access_token` at the top level.

### Mock data still showing
If you see 8 tenants with names like "Fresh Bites Cafe", the page is still using `platformAdmin.data.ts` mock data instead of calling the real API. Check the page component's data fetching — it should use functions from `tenants.api.ts` (e.g., `listTenants()`, `getMyraAdminDashboard()`).

### API calls failing with 401
The auth token might not be set in localStorage. After login, check `localStorage.getItem('myra-auth')` — it should contain a valid JWT token. The `createApiClient()` function reads from the Zustand auth store which persists to localStorage under the `myra-auth` key.

### Response envelope issues
All backend APIs return `{ success: boolean, data: T }`. The `createApiClient()` response interceptor in `apiClient.ts` automatically unwraps this. If a page is getting the raw envelope instead of the data, it might be using a raw axios instance instead of `createApiClient()`.

## Devin Secrets Needed
No external secrets needed — all testing uses local docker-compose services with the admin user created above.

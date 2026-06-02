# Authentication And Token Management

## Admin Sessions

Admin users authenticate with `POST /api/v1/auth/login`. The response should include a short-lived access token and user profile. The gateway should also set a secure, httpOnly refresh cookie.

The frontend stores the access token in the auth store for API authorization and sends `withCredentials: true` so cookie-based refresh works. When a request returns `401`, the API client attempts `POST /api/v1/auth/refresh` once and retries the original request with the new token.

## CSRF

For state-changing requests, the frontend reads the `MYRA_CSRF_TOKEN` cookie and sends it as `X-CSRF-Token`. The gateway should validate the header against the cookie/session and reject invalid requests.

## Widget API Keys

The widget flow should support `X-Api-Key` for public embed compatibility. A public widget key should be scoped to a tenant, rate-limited, and restricted to `/api/chat` and `/api/leads`.

## Storage Notes

True httpOnly token storage must be implemented by the backend because browser JavaScript cannot create httpOnly cookies. The frontend is prepared for that model by enabling credentials and refresh requests. Until the gateway issues secure cookies, the access token remains in the client auth store for compatibility with existing endpoints.

# Component Notes

## Buttons

Use `Button` from `src/components/ui/button.tsx` for all commands. Primary buttons use the Myra teal-to-purple gradient; secondary and outline buttons use white surfaces with the shared border token.

## Status Badges

Use `StatusBadge` from `src/components/shared/StatusBadge.tsx` for tenant, document, payment, and workflow states.

Mapped states:

- `ACTIVE`, `SUCCESS`, `COMPLETED`, `PAID`, `SENT`: success
- `PENDING`, `PENDING_PAYMENT`, `QUEUED`, `SCHEDULED`: warning/default
- `FAILED`, `REJECTED`, `SUSPENDED`, `CANCELED`: error
- `INACTIVE`, `DRAFT`, `NOT_SUBMITTED`: muted

## Error Boundary

`src/app/ErrorBoundary.tsx` catches React render errors and sends structured error context to the logging layer. Keep route-level content inside the boundary in `App`.

## Forms

Forms should use `react-hook-form` and `zod` where possible. Inputs need visible labels, error text near the field, and `aria-invalid`/`aria-describedby` when custom form components are introduced.

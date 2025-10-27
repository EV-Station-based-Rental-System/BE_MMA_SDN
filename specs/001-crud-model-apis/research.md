# Phase 0 Research: CRUD APIs for Models

## Decisions

- Deletion policy: Prefer soft-delete where schema supports a status flag
  (e.g., `is_active` for User, Vehicle, Station). For entities without a
  soft-delete flag (e.g., Booking, Rental, Payment), perform hard-delete
  only when no downstream references exist; otherwise block and return a
  clear message.
- Role matrix (Phase 1):
  - Admin: Full CRUD on User, Vehicle, Station, Booking, Rental, Payment.
  - Staff: CRUD on operational (Booking, Rental, Payment); read-only on
    Vehicle, Station, and User profile views.
  - Renter: Read own Booking/Rental/User/Renter; can cancel own bookings
    and update own profile fields where allowed.
- Pagination defaults: `page=1`, `take=10`, with `take<=100` enforced.
- Sorting: Whitelist per entity; default sort by `created_at` when present.
- Filtering: Provide minimal practical filters per entity (status, date range,
  ownership/user for user-facing data). Document allowed fields.
- Contracts: Provide OpenAPI 3.1 contract for Phase 1 entities with shared
  response wrappers: `ResponseList` (data + meta) and `ResponseDetail` (data).

## Rationale

- Soft-delete preserves auditability and aligns with existing schemas that
  already expose flags (User, Vehicle, Station). Blocking hard-delete for
  referenced records prevents integrity issues for operational entities.
- The role matrix follows the project’s Constitution and current modules
  (stations/vehicles/users) while enabling staff workflows and renter
  self-service for limited actions.
- Pagination and sorting standards align with Constitution Principle V and VI
  and existing services (stations, vehicles).

## Alternatives Considered

- Global hard-delete with cascading: Rejected due to accidental data loss risk
  and conflicts with audit needs.
- Per-entity bespoke deletion logic: Deferred for later phases; Phase 1 uses a
  consistent policy to simplify implementation and testing.
- Unlimited page sizes: Rejected; 100 max reduces load and aligns with current
  codebase patterns.

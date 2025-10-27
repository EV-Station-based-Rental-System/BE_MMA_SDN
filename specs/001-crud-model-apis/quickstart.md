# Quickstart: Phase 1 CRUD APIs

## Prerequisites

- Environment variables: see `.env` (MONGO_URI, JWT_SECRET_KEY, JWT_EXPIRES_IN, MAIL_*, REDIS_URL).
- Install dependencies: `pnpm install`
- Start server: `pnpm run start:dev` (API on `http://localhost:3001`, Swagger at `/api`).

## Authentication

- Use login to obtain JWT, then include `Authorization: Bearer <token>`.
- Roles are enforced per endpoint (Admin/Staff/Renter per spec).

## Endpoints (Phase 1)

- Users: `GET/POST /user`, `GET/PUT/DELETE /user/{id}`
- Vehicles: `GET/POST /vehicle`, `GET/PUT/DELETE /vehicle/{id}`
- Stations: `GET/POST /station`, `GET/PUT/DELETE /station/{id}`
- Bookings: `GET/POST /booking`, `GET/PUT/DELETE /booking/{id}`, renter self-service `GET /booking/me`, `PATCH /booking/{id}/cancel`
- Rentals: `GET/POST /rental`, `GET/PUT/DELETE /rental/{id}`, renter self-service `GET /rental/me`
- Payments: `GET/POST /payment`, `GET/PUT/DELETE /payment/{id}`

## Pagination & Sorting

- Query params: `page` (default 1), `take` (default 10, max 100)
- Sort whitelisted per entity; default by `created_at` where available.

## Response shape

- List: `{ data: [...], meta: { total, page, take } }`
- Detail: `{ data: { ... } }`
- Message: `{ message: "..." }`

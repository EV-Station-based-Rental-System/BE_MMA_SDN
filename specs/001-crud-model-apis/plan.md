# Implementation Plan: Simple CRUD APIs for All Models

**Branch**: `001-crud-model-apis` | **Date**: 2025-10-27 | **Spec**: `/specs/001-crud-model-apis/spec.md`
**Input**: Feature specification from `/specs/001-crud-model-apis/spec.md`

Note: This plan follows the repository Constitution at `.specify/memory/constitution.md`.

## Summary

Deliver Phase 1 CRUD APIs for the following entities: User, Vehicle, Station, Booking, Rental, and Payment. Each entity exposes list (pagination, sorting, basic filtering), detail, create, update, and delete endpoints. Controllers remain thin and delegate to services; validation uses DTOs with class-validator/transformer and Swagger stays in sync. Access is enforced via JWT + role guards (Admin/Staff/Renter) per spec. Persistence uses Mongoose 8 schemas under `src/models` and shared pagination/sorting helpers. Deletion policy prefers soft-delete where supported; otherwise block hard-delete when referenced.

## Technical Context

**Language/Version**: TypeScript 5.7 (ES2023)
**Runtime**: Node.js (Linux server)
**Primary Dependencies**: NestJS 11, @nestjs/mongoose 11, Mongoose 8, @nestjs/swagger 11, class-validator, class-transformer, passport + JWT, rxjs
**Storage**: MongoDB via Mongoose
**Testing**: Jest (unit + e2e), Supertest, mongodb-memory-server
**Target Platform**: Linux server (container-friendly)
**Project Type**: Single backend service (NestJS)
**Performance Goals**: List endpoints return within 2s for default page sizes; `take` capped at 100; stable default sorting
**Constraints**: Global ValidationPipe (whitelist, forbidNonWhitelisted, transform); shared pagination/sorting helpers; soft-delete where available; consistent response wrappers and error classes
**Scale/Scope**: Phase 1 scope only: User, Vehicle, Station, Booking, Rental, Payment

## Constitution Check

Gate status: PASS (pre‑research). Re‑checked after design: PASS.

- Modular Nest architecture: modules under `src/modules/<feature>` with thin controllers and singular base paths (Principle I). Plan adheres.
- DTO validation + Swagger sync: explicit DTOs with class‑validator, class‑transformer, `PartialType` for updates, and `@ApiProperty*` on fields (Principle II). Plan adheres.
- API docs + response wrappers: use `SwaggerResponseDetailDto`, `SwaggerResponseListDto`, `ResponseMsg`, with proper status mappings and `@ApiExtraModels` (Principle III). Plan adheres.
- Security & access control: apply `JwtAuthGuard`, `RolesGuard`, `@Roles(...)`, `@ApiBearerAuth()` on guarded routes (Principle IV). Plan adheres.
- Persistence discipline: schemas in `src/models`, exported via `src/models/index.ts`, injected via `@InjectModel`, reuse shared pagination/sorting helpers with whitelists (Principle V). Plan adheres.
- Controllers & services pattern: follows Vehicles/Stations standards for CRUD flows and exceptions (Principle VI). Plan adheres.
- Configuration & env: use global `ConfigModule`; required keys set for local dev (MONGO_URI, JWT_* , MAIL_*, REDIS_URL). Plan adheres.

No deviations from the Constitution. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-crud-model-apis/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
└── checklists/          # Requirements checks (if any)
```

### Source Code (repository root)

```text
src/
├── app.module.ts
├── main.ts
├── models/                     # Mongoose schemas (exported via index.ts)
├── common/                     # shared utils, enums, guards, interceptors, response wrappers, pagination
└── modules/
    ├── vehicles/
    ├── stations/
    ├── users/
    ├── bookings/
    ├── rentals/                # to be completed per Phase 1
    └── payments/               # to be completed per Phase 1

test/
├── app.e2e-spec.ts
├── vehicles.e2e-spec.ts
└── jest-e2e.json
```

**Structure Decision**: Single backend service using NestJS modules under `src/modules` with Mongoose schemas in `src/models` and shared utilities in `src/common`. Documentation for this feature lives under `specs/001-crud-model-apis`.

## Complexity Tracking

No violations; section not applicable.


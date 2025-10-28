# Implementation Plan: CRUD APIs for Models

**Branch**: `001-crud-model-apis` | **Date**: 2025-10-27 | **Spec**: specs/001-crud-model-apis/spec.md
**Input**: Feature specification from `/specs/001-crud-model-apis/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement simple, role-aware CRUD REST APIs for Phase 1 entities
+(User incl. Admin/Staff/Renter details, Vehicle, Station, Booking,
+Rental, Payment). Endpoints follow NestJS conventions, return shared
+response wrappers, enforce DTO validation and authorization, provide
+pagination/sorting/filtering, and honor the deletion policy (prefer
+soft-delete where supported; otherwise block hard-delete when
+referenced). OpenAPI contracts included]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.7; ES2023 target  
**Primary Dependencies**: NestJS 11, @nestjs/mongoose 11, Mongoose 8,
@nestjs/swagger 11, class-validator/transformer, @nestjs/jwt, ioredis  
**Storage**: MongoDB (Mongoose)  
**Testing**: Jest (unit/integration), Supertest (e2e)  
**Target Platform**: Linux server (Node.js)
**Project Type**: single backend  
**Performance Goals**: List endpoints return within 2s at default page sizes; max page size 100  
**Constraints**: JWT auth + role guards; soft-delete where supported; block hard-delete when referenced; validated DTOs; consistent wrappers  
**Scale/Scope**: Phase 1 entities (6 sets of CRUD endpoints) with pagination and filtering on key fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Modular Nest Architecture & Thin Controllers
  - New modules/controllers placed under `src/modules/<entity>`; thin
    controllers delegating to services.
- II. Strict DTO Validation & Transformation with Swagger Sync
  - All DTOs use class-validator/transformer; Swagger decorators for
    all fields and bodies.
- III. Consistent API Documentation & Response Wrappers
  - Use ApiOperation/ApiOk/ApiCreated; `SwaggerResponseDetailDto` /
    `SwaggerResponseListDto` and `ResponseMsg` for message-only.
- IV. Security & Access Control by Default
  - `@UseGuards(JwtAuthGuard, RolesGuard)`; `@Roles(...)` per role
    matrix; `@ApiBearerAuth()` on guarded routes.
- V. Persistence Discipline & Shared Utilities
  - Use existing schemas, pagination helpers, sorting whitelist,
    and common utilities.
- VI. Controllers & Services Pattern (Vehicles/Stations Standard)
  - Follow same conventions for base paths, decorators, and
    response patterns.

Gate evaluation: PASS. No deviations required.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── models/                 # Existing Mongoose schemas
├── modules/                # Controllers/Services per entity
│   ├── stations/
│   ├── vehicles/
│   ├── users/
│   └── ... (to add bookings, rentals, payments)
└── common/                 # Pagination, responses, guards, exceptions

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Single backend project. Add missing modules for
Booking, Rental, Payment under `src/modules/` following vehicle/station
patterns

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

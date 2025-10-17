<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: Initialized (no renames)
- Added sections: Configuration & Environment; Development Workflow & Quality Gates
- Removed sections: None
- Templates requiring updates:
  - ✅ Updated: .specify/templates/plan-template.md (Constitution Check + removed broken reference)
  - ✅ Reviewed: .specify/templates/spec-template.md (no changes needed)
  - ✅ Reviewed: .specify/templates/tasks-template.md (no changes needed)
  - ✅ Reviewed: .specify/templates/checklist-template.md (no changes needed)
  - ⚠ None found: .specify/templates/commands/*.md (directory absent)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Set original adoption date when approved by maintainers
-->

# BE_MMA_SDN Constitution

## Core Principles

### I. Modular Nest Architecture & Thin Controllers
- Modules MUST be scaffolded under `src/modules/<feature>` using the Nest CLI and
  follow the structure: `dto/`, `<feature>.controller.ts`, `<feature>.service.ts`,
  `<feature>.module.ts`.
- File naming MUST be plural for primary domain entities (e.g., `vehicles.controller.ts`)
  and singular for relationship entities (e.g., `vehicle_station.controller.ts`).
- Controllers MUST stay thin and delegate data access and business logic to services.
- Feature modules MUST be registered in `AppModule` once providers are ready. Services
  MUST inject repositories via `@InjectModel(...)` after schema registration.
Rationale: Enforces consistent architecture, improves maintainability, and keeps
responsibilities clear across modules, controllers, and services.

### II. Strict DTO Validation & Transformation with Swagger Sync
- DTOs MUST explicitly declare every accepted property to satisfy the global
  `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- DTOs MUST use `class-validator` decorators (e.g., `@IsString`, `@IsNumber`,
  `@IsEnum`, `@IsOptional`) and `class-transformer` (e.g., `@Type(() => Date)`)
  to ensure correct runtime types.
- Every DTO field MUST be decorated with `@ApiProperty` or `@ApiPropertyOptional`
  so Swagger stays in sync with runtime expectations.
- Update DTOs MUST implement the `PartialType` pattern to inherit validation rules.
Rationale: Guarantees runtime safety and makes the API contract explicit and discoverable.

### III. Consistent API Documentation & Response Wrappers
- Each controller handler MUST pair `@ApiOperation` with the appropriate success
  response decorator (`@ApiCreatedResponse`, `@ApiOkResponse`,
  `@ApiNoContentResponse`, etc.).
- Guarded routes MUST include `@ApiBearerAuth()` so Swagger advertises JWT.
- Success payloads MUST be returned via shared wrappers
  (`ResponseDetail`, `ResponseList`, `ResponseMsg`); never return raw documents.
- Error responses MUST use shared classes (`ResponseBadRequest`,
  `ResponseUnauthorized`, `ResponseForbidden`, `ResponseNotFound`,
  `ResponseConflict`, `ResponseInternalError`) and project-specific exceptions
  from `src/common/exceptions`.
Rationale: Delivers uniform client experience, improves observability, and reduces
integration risk.

### IV. Security & Access Control by Default
- Endpoints MUST be protected with `@UseGuards(JwtAuthGuard, RolesGuard)` as
  applicable and scoped with `@Roles(...)` using the `Role` enum.
- Authentication strategies MUST live under `src/modules/auth/strategies` and be
  wired through `AuthModule` when new flows are introduced.
- `HttpErrorInterceptor` MUST remain enabled to normalize error shapes across the
  API.
Rationale: Minimizes security risk and ensures consistent access control and error
formatting across the platform.

### V. Persistence Discipline & Shared Utilities
- MongoDB schemas MUST reside in `src/models/<feature>.schema.ts` and be
  decorated with `@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })`.
  Apply required defaults and references consistent with domain models.
- All schemas MUST be exported via `src/models/index.ts`, imported in feature
  modules with `MongooseModule.forFeature(...)`, and injected via `@InjectModel`.
- Aggregations and list queries MUST use shared pagination helpers
  (`applyCommonFiltersMongo`, `applySortingMongo`, `applyPaginationMongo`, `applyFacetMongo`).
- Teams MUST reuse shared utilities: hashing and converters in
  `src/common/utils/helper.ts`, `MailModule/MailService`, and `RedisModule/REDIS_CLIENT`.
Rationale: Standardizes data access and encourages reuse, improving performance and
reducing duplication.

## Configuration & Environment

- Configuration MUST be loaded via the global `ConfigModule` with environment
  variables. Required keys for local development:
  `MONGO_URI`, `JWT_SECRET_KEY`, `JWT_EXPIRES_IN`, `GMAIL_USER`, `GMAIL_PASS`,
  `MAIL_HOST`, `MAIL_PORT`, `REDIS_URL`.
- Missing Gmail or Redis values may disable their providers; supply safe
  placeholders when those integrations are optional in local work.
- Useful scripts: `pnpm run start:dev` (API on port `3001`, Swagger at `/api`),
  `pnpm run lint`, `pnpm run format`, `pnpm run test`, `pnpm run test:e2e`.
Rationale: Follows 12‑Factor configuration to keep environments reproducible and secure.

## Development Workflow & Quality Gates

- Scaffold features via the Nest CLI following the “Fleet” walkthrough as an
  example; update `AppModule`, register schemas, and wire providers before usage.
- During implementation, verify:
  - Module/file naming adheres to Principle I.
  - DTOs satisfy Principle II and Swagger reflects all fields.
  - Controllers return shared response wrappers and include complete Swagger
    annotations (Principle III).
  - Guards, roles, and strategies conform to Principle IV.
  - Schemas, indexes, and data access comply with Principle V.
- Plans generated from `.specify/templates/plan-template.md` MUST pass the
  Constitution Check before Phase 0 research proceeds.
Rationale: Keeps delivery predictable and enforces compliance early in the cycle.

## Governance

- Authority: This Constitution supersedes conflicting guidance elsewhere in this
  repository. Deviations MUST include a written justification in the feature plan
  under “Complexity Tracking”.
- Amendments: Propose changes via PR editing `.specify/memory/constitution.md`.
  Require approval from at least one maintainer. Include migration notes where
  practices change.
- Compliance: All PR reviews MUST verify adherence to Core Principles. The Plan
  “Constitution Check” MUST pass before major work begins and be re‑verified at
  design completion.
- Versioning: Use semantic versioning for this Constitution.
  - MAJOR: Backward‑incompatible governance or removal/redefinition of principles.
  - MINOR: New principle or materially expanded guidance.
  - PATCH: Clarifications, wording, or non‑semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2025-10-17 | **Last Amended**: 2025-10-17

# Implementation Plan: Registration & eKYC

**Branch**: `[001-registration-ekyc]` | **Date**: 2025-10-18 | **Spec**: specs/001-registration-ekyc/spec.md
**Input**: Feature specification from `/specs/001-registration-ekyc/spec.md`

## Summary

Deliver an end-to-end eKYC flow for renters: email-OTP account verification, eKYC submission with documents + selfie, manual review decisions (no auto-checking in v1), and a station fast path with override. Provide immutable audit logging, notifications on transitions, and compliance foundations (retention + deletion). Implement as a NestJS module with thin controllers, strict DTO validation, Mongoose schemas, and shared response wrappers per the Constitution.

## Technical Context

**Language/Version**: TypeScript (NestJS 11), Node 20+  
**Primary Dependencies**: @nestjs/*, mongoose 8.x, class-validator, class-transformer, @nestjs/swagger  
**Storage**: MongoDB (Mongoose schemas; shared pagination helpers for listings)  
**Testing**: Jest (unit/e2e), mongodb-memory-server  
**Target Platform**: Backend API (Linux server; Swagger at `/api`)  
**Project Type**: Single backend service (NestJS)  
**Performance Goals**: `submitted → pending_review` within 5s (p95); staff decisions within 24h (p95)  
**Constraints**: Strict DTO validation (whitelist/forbid); JWT + Roles guards on staff/station routes; response wrappers required  
**Scale/Scope**: 10k+ renters; 100+ concurrent station verifications peak

## Constitution Check

GATE must pass before implementation. Design adheres as follows:

- Architecture: New `ekyc` feature module under `src/modules/ekyc`; thin controllers; singular controller base path `ekyc`; module registered in `AppModule`. Services inject repositories via `@InjectModel` after schema registration.
- DTOs & Swagger: All DTOs validated (`class-validator`), transformed, and documented (`@ApiProperty*`); update DTOs via `PartialType`.
- API Responses: Use `ResponseDetail`/`ResponseList`/`ResponseMsg`; handlers annotated with `@ApiOperation` and correct success decorators; guarded routes include `@ApiBearerAuth()`.
- Errors & Exceptions: Use shared error classes and project exceptions; keep `HttpErrorInterceptor` enabled.
- Security: Apply `@UseGuards(JwtAuthGuard, RolesGuard)`; scope with `@Roles(Role.STAFF, Role.ADMIN)` for backoffice and station; renter routes with `@Roles(Role.RENTER)` where needed.
- Persistence: Schemas under `src/models/*.schema.ts` with timestamps; exported via `src/models/index.ts`; imported with `MongooseModule.forFeature`; shared pagination/sorting helpers for lists.
- Configuration: Use global `ConfigModule`; no secrets hardcoded. Dev bypass flags available for OTP/email/upload if needed.

Status: PASS (no violations).

## Project Structure

### Documentation (this feature)

```
specs/001-registration-ekyc/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```
src/
├── models/
│   ├── ekyc_submission.schema.ts
│   ├── ekyc_document.schema.ts
│   ├── review_action.schema.ts
│   ├── audit_log.schema.ts
│   └── user.schema.ts (augment: contact verification flags)
└── modules/
    └── ekyc/
        ├── dto/
        ├── ekyc.controller.ts
        ├── ekyc.service.ts
        └── ekyc.module.ts
```

**Structure Decision**: Single backend project; add one feature module (`ekyc`) and four schemas. No new apps/packages.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | — | — |


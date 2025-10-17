# Registration & eKYC — Quickstart (v1 Manual)

## Module
- `src/modules/ekyc`: `ekyc.controller.ts`, `ekyc.service.ts`, `ekyc.module.ts`
- Guards: `@UseGuards(JwtAuthGuard, RolesGuard)`; `@ApiBearerAuth()` on guarded routes

## Renter Endpoints
- POST `ekyc/draft` → Create/return active draft
- POST `ekyc/documents` → Attach doc to draft (type: id_front/id_back/dl_front/dl_back/passport/selfie/liveness)
- POST `ekyc/submit` → Require email-verified; transition to `pending_review`
- GET `ekyc/status` → Current submission state
- POST `ekyc/resubmit` → New draft if allowed

## Staff Endpoints
- GET `ekyc/reviews` → List `pending_review` submissions (pagination)
- POST `ekyc/reviews/:submissionId/approve` → Approve (reason/evidence required)
- POST `ekyc/reviews/:submissionId/reject` → Reject (reason/evidence required)

## Station Fast Path
- POST `ekyc/station/verify` → Approve or approve_with_override, include photos, `staff_id`, `station_id`

## DTO Notes
- Strict `class-validator`; document with Swagger decorators; return shared response wrappers.


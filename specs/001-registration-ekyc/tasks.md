---
description: "Executable task list for Registration & eKYC feature"
---

# Tasks: Registration & eKYC

**Input**: Design documents from `/specs/001-registration-ekyc/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; omitting test tasks in this pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- [P]: Can run in parallel (different files, no dependencies)
- [Story]: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal prerequisites and feature scaffolding

- [ ] T001 Create feature module shell in src/modules/ekyc/ekyc.module.ts
- [ ] T002 [P] Create controller shell in src/modules/ekyc/ekyc.controller.ts
- [ ] T003 [P] Create service shell in src/modules/ekyc/ekyc.service.ts
- [ ] T004 [P] Create DTO folder placeholder in src/modules/ekyc/dto/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infra that MUST be complete before user stories

- [ ] T005 Add eKYCSubmission schema in src/models/ekyc_submission.schema.ts
- [ ] T006 [P] Add eKYC Document schema in src/models/ekyc_document.schema.ts
- [ ] T007 [P] Add ReviewAction schema in src/models/review_action.schema.ts
- [ ] T008 [P] Add AuditLog schema in src/models/audit_log.schema.ts
- [ ] T009 Export new schemas in src/models/index.ts
- [ ] T010 Wire module in AppModule imports in src/app.module.ts
- [ ] T011 Add eKYC enums (doc types, states) in src/common/enums/ekyc.enum.ts
- [ ] T012 Align User schema: add email_verified_at, phone_verified_at, contact_verified in src/models/user.schema.ts
- [ ] T013 Fix User save override (remove throwing method) in src/models/user.schema.ts
- [ ] T014 Align AuthService to use `password` field consistently in src/modules/auth/auth.service.ts

**Checkpoint**: Foundation ready—user story work can now begin

---

## Phase 3: User Story 1 - Create Account with Contact Verification (Priority: P1) 🎯 MVP

**Goal**: Email OTP verification enables eKYC access; reflect verification flags

**Independent Test**: Register renter → send-otp → verify-email → flags set

### Implementation for User Story 1

- [ ] T015 [US1] Set email_verified_at + contact_verified on verify in src/modules/auth/auth.service.ts
- [ ] T016 [P] [US1] Add Swagger docs for verify endpoints in src/modules/auth/auth.controller.ts
- [ ] T017 [P] [US1] Expose contact verification flags in user fetch in src/modules/users/users.service.ts

**Checkpoint**: US1 is independently testable via auth endpoints

---

## Phase 4: User Story 2 - Submit eKYC Online (Priority: P1)

**Goal**: Renter drafts, uploads docs, and submits to pending_review

**Independent Test**: Draft → documents attach → submit → pending_review

### Implementation for User Story 2

- [ ] T018 [P] [US2] DTO: CreateDraftDto in src/modules/ekyc/dto/create-draft.dto.ts
- [ ] T019 [P] [US2] DTO: UploadDocumentDto in src/modules/ekyc/dto/upload-document.dto.ts
- [ ] T020 [P] [US2] DTO: SubmitDto in src/modules/ekyc/dto/submit.dto.ts
- [ ] T021 [US2] Service: createDraft() in src/modules/ekyc/ekyc.service.ts
- [ ] T022 [US2] Service: attachDocument() in src/modules/ekyc/ekyc.service.ts
- [ ] T023 [US2] Service: submitToPendingReview() in src/modules/ekyc/ekyc.service.ts
- [ ] T024 [P] [US2] Service: getStatus() in src/modules/ekyc/ekyc.service.ts
- [ ] T025 [P] [US2] Service: resubmit() in src/modules/ekyc/ekyc.service.ts
- [ ] T026 [US2] Controller: POST /ekyc/draft in src/modules/ekyc/ekyc.controller.ts
- [ ] T027 [US2] Controller: POST /ekyc/documents in src/modules/ekyc/ekyc.controller.ts
- [ ] T028 [US2] Controller: POST /ekyc/submit in src/modules/ekyc/ekyc.controller.ts
- [ ] T029 [P] [US2] Controller: GET /ekyc/status in src/modules/ekyc/ekyc.controller.ts
- [ ] T030 [P] [US2] Controller: POST /ekyc/resubmit in src/modules/ekyc/ekyc.controller.ts
- [ ] T031 [US2] Guards: Jwt + Roles(RENTER) on renter APIs in src/modules/ekyc/ekyc.controller.ts
- [ ] T032 [US2] Swagger + response wrappers on renter APIs in src/modules/ekyc/ekyc.controller.ts
- [ ] T033 [P] [US2] Validate allowed doc types (DL/ID/passport + selfie) in src/modules/ekyc/ekyc.service.ts

**Checkpoint**: US2 independently testable via eKYC endpoints

---

## Phase 5: User Story 3 - Manual Review (Priority: P1)

**Goal**: Staff can approve/reject with reason + evidence; fully audited

**Independent Test**: List pending_review → approve/reject → audit entries

### Implementation for User Story 3

- [ ] T034 [P] [US3] Controller: GET /ekyc/reviews (list) in src/modules/ekyc/ekyc.controller.ts
- [ ] T035 [US3] Controller: POST /ekyc/reviews/:id/approve in src/modules/ekyc/ekyc.controller.ts
- [ ] T036 [US3] Controller: POST /ekyc/reviews/:id/reject in src/modules/ekyc/ekyc.controller.ts
- [ ] T037 [US3] Guards: Jwt + Roles(STAFF, ADMIN) on staff APIs in src/modules/ekyc/ekyc.controller.ts
- [ ] T038 [US3] Service: listPendingReview() in src/modules/ekyc/ekyc.service.ts
- [ ] T039 [US3] Service: approveWithReviewAction() in src/modules/ekyc/ekyc.service.ts
- [ ] T040 [US3] Service: rejectWithReviewAction() in src/modules/ekyc/ekyc.service.ts
- [ ] T041 [P] [US3] Mirror status to Kycs in src/modules/ekyc/ekyc.service.ts
- [ ] T042 [P] [US3] Write audit logs for decisions in src/modules/ekyc/ekyc.service.ts

**Checkpoint**: US3 independently testable by staff-only flows

---

## Phase 6: User Story 4 - Fast Path at Station (Priority: P1)

**Goal**: Station staff approve normally or with override; fully audited

**Independent Test**: Station verify approve/override → audit includes station metadata

### Implementation for User Story 4

- [ ] T043 [P] [US4] DTO: StationVerifyDto in src/modules/ekyc/dto/station-verify.dto.ts
- [ ] T044 [US4] Controller: POST /ekyc/station/verify in src/modules/ekyc/ekyc.controller.ts
- [ ] T045 [US4] Guards: Jwt + Roles(STAFF, ADMIN) in src/modules/ekyc/ekyc.controller.ts
- [ ] T046 [US4] Service: stationVerify() with override support in src/modules/ekyc/ekyc.service.ts
- [ ] T047 [P] [US4] Attach evidence photos to audit log in src/modules/ekyc/ekyc.service.ts

**Checkpoint**: US4 independently testable by station staff

---

## Phase 7: User Story 5 - Escalation (Priority: P2)

**Goal**: Route repeated soft-fail cases to pending_review or station_required per policy (no auto caps)

**Independent Test**: Trigger repeated soft-fails → next submission routed per policy

### Implementation for User Story 5

- [ ] T048 [P] [US5] Add status_reason/next_action fields in src/models/ekyc_submission.schema.ts
- [ ] T049 [US5] Apply policy routing on submit in src/modules/ekyc/ekyc.service.ts
- [ ] T050 [P] [US5] Update status reporting in src/modules/ekyc/ekyc.controller.ts

**Checkpoint**: US5 independently testable by policy simulation

---

## Phase 8: User Story 6 - Notifications (Priority: P2)

**Goal**: Notify on transitions via in-app and configured email/SMS

**Independent Test**: Observe notifications on submit/approve/reject

### Implementation for User Story 6

- [ ] T051 [P] [US6] Create NotificationService in src/modules/ekyc/notification.service.ts
- [ ] T052 [US6] Hook notifications on transitions in src/modules/ekyc/ekyc.service.ts
- [ ] T053 [P] [US6] Implement email channel via MailModule in src/modules/ekyc/notification.service.ts
- [ ] T054 [P] [US6] Record notify.sent entries in src/models/audit_log.schema.ts

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories

- [ ] T055 [P] Documentation updates in specs/001-registration-ekyc/quickstart.md
- [ ] T056 Code cleanup and refactoring in src/modules/ekyc/
- [ ] T057 [P] Performance optimization for list queries in src/modules/ekyc/ekyc.service.ts
- [ ] T058 Security hardening and role checks in src/modules/ekyc/ekyc.controller.ts
- [ ] T059 Run quickstart validation against contracts in specs/001-registration-ekyc/contracts/openapi.yml

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No deps; start immediately
- Foundational (Phase 2): Blocks all user stories
- User Stories (Phase 3+): Start after Phase 2; P1 stories can proceed in parallel if staffed
- Polish (Final): After desired stories complete

### User Story Dependencies

- US1 → US2 (eKYC gated by verified email)
- US2 → US3, US4 (review and station paths depend on submissions)
- US3/US4 → US5 (policy routing refinement)
- US2/US3/US4 → US6 (notifications on transitions)

### Parallel Opportunities

- Phase 2 schemas (T006–T008) in parallel
- US2 DTOs and read-only endpoints in parallel
- US3 list endpoint and audit logging in parallel
- US6 channel implementations in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 (Email OTP verification flags)
4. STOP and validate US1 independently

### Incremental Delivery

1. US2 (draft→submit) → demo
2. US3 (manual review) → demo
3. US4 (station fast path) → demo
4. US5 (policy routing) → demo
5. US6 (notifications) → demo


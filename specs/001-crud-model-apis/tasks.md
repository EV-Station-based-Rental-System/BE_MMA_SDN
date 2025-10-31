---

description: "Executable task list for Simple CRUD APIs for All Models"
---

# Tasks: Simple CRUD APIs for All Models

**Input**: Design documents from `/specs/001-crud-model-apis/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL. This plan focuses on implementation tasks; add tests if explicitly requested.

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: Which user story this task belongs to (e.g., US1, US2, US3)
- All file paths are absolute

## Phase 1: Setup (Shared Infrastructure)

Purpose: Confirm core server configuration and documentation alignment

- [X] T001 Ensure required env keys are handled in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/config/config.ts`
- [X] T002 [P] Confirm ValidationPipe and HttpErrorInterceptor are configured in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/main.ts`
- [X] T003 [P] Confirm Swagger BearerAuth is configured in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/main.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: Shared pagination/filtering artifacts for all new CRUD modules

- [X] T004 Create booking filter mapping in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/pagination/filters/booking-field-mapping.ts`
- [X] T005 [P] Create rental filter mapping in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/pagination/filters/rental-field-mapping.ts`
- [X] T006 [P] Create payment filter mapping in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/pagination/filters/payment-field-mapping.ts`
- [X] T007 Create Booking pagination DTO in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/pagination/dto/booking/booking-pagination.dto.ts`
- [X] T008 [P] Create Rental pagination DTO in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/pagination/dto/rental/rental-pagination.dto.ts`
- [X] T009 [P] Create Payment pagination DTO in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/common/pagination/dto/payment/payment-pagination.dto.ts`

Checkpoint: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin manages catalog entities (Priority: P1) 🎯 MVP

Goal: Admin can CRUD Users, Vehicles, Stations with pagination, sorting, and consistent responses

Independent Test: From a fresh environment, an admin can add a station and vehicle, update details, list them with paging and sorting, view a record, and delete one safely

### Implementation for User Story 1

- [X] T010 [US1] Create singular User CRUD controller at `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/users/user.controller.ts` with base path `user` (list/detail/create/update/delete)
- [X] T011 [P] [US1] Create DTOs `CreateUserDto` and `UpdateUserDto` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/users/dto/`
- [X] T012 [US1] Register `UserController` in module at `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/users/users.module.ts`
- [X] T013 [P] [US1] Fix station sort default to `created_at` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/stations/stations.service.ts`
- [X] T014 [P] [US1] Align OpenAPI contract for User endpoints in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/specs/001-crud-model-apis/contracts/openapi.yaml` (use `/user`)
- [X] T015 [P] [US1] Add generic UsersService `create` and `findAll` (all users) in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/users/users.service.ts`

Checkpoint: User, Vehicle, Station CRUD verified and documented with consistent wrappers

---

## Phase 4: User Story 2 - Staff manage operational records (Priority: P2)

Goal: Staff can CRUD operational records (Bookings, Rentals, Payments) with validation and role-based access

Independent Test: Staff creates a booking referencing valid entities, updates status, lists bookings with filters, views details, and resolves or deletes per policy

### Implementation for User Story 2

- [X] T016 [US2] Scaffold BookingsModule in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.module.ts`
- [X] T017 [P] [US2] Create `CreateBookingDto` and `UpdateBookingDto` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/dto/`
- [X] T018 [P] [US2] Implement Booking service CRUD + pagination in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.service.ts` using mapping and DTOs
- [X] T019 [P] [US2] Implement Booking controller in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.controller.ts` with guards, Swagger wrappers, and role matrix
- [X] T020 [US2] Import `BookingsModule` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/app.module.ts`
- [X] T021 [US2] Scaffold RentalsModule in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/rentals.module.ts`
- [X] T022 [P] [US2] Create `CreateRentalDto` and `UpdateRentalDto` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/dto/`
- [X] T023 [P] [US2] Implement Rental service CRUD + pagination in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/rentals.service.ts` using mapping and DTOs
- [X] T024 [P] [US2] Implement Rental controller in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/rentals.controller.ts` with guards, Swagger wrappers, and role matrix
- [X] T025 [US2] Import `RentalsModule` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/app.module.ts`
- [X] T026 [US2] Scaffold PaymentsModule in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/payments/payments.module.ts`
- [X] T027 [P] [US2] Create `CreatePaymentDto` and `UpdatePaymentDto` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/payments/dto/`
- [X] T028 [P] [US2] Implement Payment service CRUD + pagination in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/payments/payments.service.ts` using mapping and DTOs
- [X] T029 [P] [US2] Implement Payment controller in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/payments/payments.controller.ts` with guards, Swagger wrappers, and role matrix
- [X] T030 [US2] Import `PaymentsModule` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/app.module.ts`

Checkpoint: Bookings, Rentals, Payments CRUD ready with RBAC and consistent responses

---

## Phase 5: User Story 3 - Renters view and manage own records (Priority: P3)

Goal: Renters can list and view their own bookings/rentals and cancel bookings within rules

Independent Test: Renter lists bookings with pagination, views a booking, cancels one within rules, and updates profile

### Implementation for User Story 3

- [X] T031 [US3] Add `GET /booking/me` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.controller.ts` filtering by JWT user
- [X] T032 [P] [US3] Add `PATCH /booking/:id/cancel` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.controller.ts` and service rules in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.service.ts`
- [X] T033 [P] [US3] Add `GET /rental/me` in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/rentals.controller.ts` filtering by JWT user
- [X] T034 [US3] Update Swagger docs for self‑service endpoints in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.controller.ts`
- [X] T035 [P] [US3] Enforce owner-scope in services at `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.service.ts` and `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/rentals.service.ts`
- [X] T036 [US3] Extend OpenAPI with `/booking/me`, `/rental/me`, and cancel operation in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/specs/001-crud-model-apis/contracts/openapi.yaml`

Checkpoint: Renter self‑service flows functional and documented

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] T037 [P] Ensure Swagger wrappers and `@ApiExtraModels` on new controllers in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/bookings/bookings.controller.ts`
- [X] T038 [P] Update Quickstart with self‑service endpoints in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/specs/001-crud-model-apis/quickstart.md`
- [X] T039 Run quickstart validation steps from `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/specs/001-crud-model-apis/quickstart.md`
- [X] T040 [P] Review sorting whitelists and default sort fields in `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/rentals/rentals.service.ts` and `/mnt/c/Users/hoangnn/Documents/MMA_SDN_PROJECT/BE_MMA_SDN/src/modules/payments/payments.service.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies — can start immediately
- Foundational (Phase 2): Depends on Setup completion — BLOCKS all user stories
- User Stories (Phase 3+): Depend on Foundational completion
  - Default order: P1 → P2 → P3
  - Team can run US phases in parallel once Phase 2 completes
- Polish (Final Phase): After all targeted stories are complete

### User Story Dependencies

- User Story 1 (P1): Starts after Phase 2 — Independent
- User Story 2 (P2): Starts after Phase 2 — Independent (uses Foundational mappings/DTOs)
- User Story 3 (P3): Starts after Phase 2 — Independent; depends on Bookings/Rentals controllers existing

### Within Each User Story

- Models/DTOs → Services → Controllers
- Add Swagger decorators and response wrappers
- RBAC and guards on protected operations
- Validate independently at checkpoint

### Parallel Opportunities

- Phase 2: T005, T006, T008, T009 can run in parallel
- US1: T011, T013, T014, T015 can run in parallel after T010
- US2: For each module, DTOs (T017, T022, T027), services (T018, T023, T028), and controllers (T019, T024, T029) can run in parallel per module after scaffolding (T016, T021, T026)
- US3: T032 and T033 can run in parallel after T031

---

## Parallel Examples

### User Story 1

```bash
# After T010 (create singular User controller):
Task: "T011 [P] [US1] Create CreateUserDto and UpdateUserDto in /src/modules/users/dto/"
Task: "T013 [P] [US1] Fix station sort default in /src/modules/stations/stations.service.ts"
Task: "T014 [P] [US1] Align OpenAPI /user endpoints in /specs/001-crud-model-apis/contracts/openapi.yaml"
Task: "T015 [P] [US1] Add UsersService create/findAll in /src/modules/users/users.service.ts"
```

### User Story 2

```bash
# After T016 (BookingsModule scaffold):
Task: "T017 [P] [US2] Create booking DTOs in /src/modules/bookings/dto/"
Task: "T018 [P] [US2] Implement bookings.service.ts CRUD + pagination"
Task: "T019 [P] [US2] Implement bookings.controller.ts with guards + Swagger"

# After T021 (RentalsModule scaffold):
Task: "T022 [P] [US2] Create rental DTOs in /src/modules/rentals/dto/"
Task: "T023 [P] [US2] Implement rentals.service.ts CRUD + pagination"
Task: "T024 [P] [US2] Implement rentals.controller.ts with guards + Swagger"

# After T026 (PaymentsModule scaffold):
Task: "T027 [P] [US2] Create payment DTOs in /src/modules/payments/dto/"
Task: "T028 [P] [US2] Implement payments.service.ts CRUD + pagination"
Task: "T029 [P] [US2] Implement payments.controller.ts with guards + Swagger"
```

### User Story 3

```bash
# After T031 (add booking/me):
Task: "T032 [P] [US3] Add cancel endpoint and service rules in /src/modules/bookings"
Task: "T033 [P] [US3] Add rental/me endpoint in /src/modules/rentals"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate → Deploy/Demo (MVP)
3. Add User Story 2 → Validate → Deploy/Demo
4. Add User Story 3 → Validate → Deploy/Demo

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational: split US1/US2/US3 across developers per Parallel Examples
3. Integrate and validate each story independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps tasks to specific user stories for traceability
- Each user story is independently completable and testable
- Use shared response wrappers and error classes as per Constitution
- Use pagination helpers and sorting whitelists with safe defaults
- Keep controllers thin; implement logic in services

# Feature Specification: Simple CRUD APIs for All Models

**Feature Branch**: `001-crud-model-apis`  
**Created**: 2025-10-27  
**Status**: Draft  
**Input**: User description: "implement simple CRUD API for all the models at /src/models"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin manages catalog entities (Priority: P1)

Admins need to create, update, list, view, and delete core catalog
entities to keep operational data accurate and up to date.

**Why this priority**: Catalog accuracy unlocks all downstream operations
(bookings, rentals, staffing). It is foundational and blocks other flows.

**Independent Test**: From a fresh environment, an admin can add a
new station and vehicle, update details, list them with paging and
sorting, view a single record, and delete a record without affecting
unrelated entities.

**Acceptance Scenarios**:

1. Given no stations exist, when admin creates a station with valid
   details, then the system confirms creation and the station appears
   in the station list and detail views.
2. Given vehicles exist, when admin updates a vehicle’s attributes,
   then the system returns the updated details and subsequent list
   results reflect the change.
3. Given entities exist, when admin requests a paged list with sort
   and filters, then results honor page, size limits, sort order, and
   filters; metadata includes total count.
4. Given an entity exists, when admin deletes it, then the record is
   removed per deletion policy and subsequent lists reflect removal or
   status change.

---

### User Story 2 - Staff manage operational records (Priority: P2)

Staff need to create, update, list, view, and delete operational
records to execute day-to-day workflows (e.g., bookings, rentals,
inspections, fees, payments, reports, staff assignments).

**Why this priority**: Operational efficiency depends on timely updates
to these records to reflect reality and drive customer interactions.

**Independent Test**: A staff member can create a booking referencing
valid entities, update its status, list bookings with filters, view a
booking’s details, and resolve or delete it per policy.

**Acceptance Scenarios**:

1. Given a valid renter and vehicle-at-station, when staff creates a
   booking, then the system validates references and confirms creation.
2. Given a booking exists, when staff updates its status, then the
   system returns updated details and history remains consistent.
3. Given records exist, when staff lists with filters (by status,
   station, date ranges), then results honor those filters and include
   pagination metadata.

---

### User Story 3 - Renters view and manage own records (Priority: P3)

Renters need read access to their own records (e.g., bookings,
rentals, KYC documents) and limited updates (e.g., cancel a booking,
update profile) to self-serve common needs.

**Why this priority**: Improves customer satisfaction and reduces staff
workload by enabling self-service for common actions.

**Independent Test**: A renter logs in, lists their bookings with
pagination, views a booking, cancels one within allowed rules, and
updates personal info.

**Acceptance Scenarios**:

1. Given a renter with bookings, when they list their bookings, then
   results include only their data with correct pagination metadata.
2. Given a renter’s editable profile fields, when they update allowed
   fields, then the system confirms the change and subsequent detail
   views reflect it.

---

### Edge Cases

- Creating/updating a record with invalid or non-existent references
  must fail with a clear message.
- Deleting an entity that is referenced by others follows this policy:
  prefer soft-delete where supported (entity remains hidden from lists),
  otherwise block hard-delete when references exist and return a clear
  message.
- Pagination requests outside bounds (page < 1 or excessive size)
  are normalized to defaults and upper limits.
- Sorting by unsupported fields defaults to a safe, documented order.
- Duplicate key attempts (e.g., unique identifiers) return a conflict
  message without creating inconsistent state.
- Attempting to access records without permission returns a clear
  authorization error without leaking data.

## Requirements *(mandatory)*

### Scope & Phasing

- Phase 1 scope (deliver now): User (including Admin/Staff/Renter role
  details), Vehicle, Station, Booking, Rental, Payment.
- Out of scope for Phase 1 (planned follow-ups): VehicleAtStation, Fee,
  Pricing, Kycs, Inspection, Report, ReportsPhoto, StaffAtStation,
  StaffTransfer, Contract, VehicleTransfer.

### Functional Requirements

- FR-001: Provide list endpoints for each model with pagination, sorting,
  and filtering on key fields. Responses include paging metadata and
  stable ordering defaults.
- FR-002: Provide detail endpoint to retrieve a single record by its
  identifier for each model. Return a clear not-found message when absent.
- FR-003: Provide create endpoint for each model that validates required
  fields and referential integrity for relationships before persisting.
- FR-004: Provide update endpoint for each model to modify existing
  records. Return updated record or a not-found message when absent.
- FR-005: Provide delete endpoint for each model honoring the agreed
  deletion policy. Return a success message and clear outcome.
- FR-006: Enforce authorization by role for create/update/delete and
  list/detail actions using this matrix for Phase 1 entities:
  - Admin: Full CRUD on all Phase 1 entities.
  - Staff: CRUD on operational records (Booking, Rental, Payment);
    read-only on catalog entities (Vehicle, Station) and User profiles.
  - Renter: Read only on own records (Booking, Rental, User/Renter
    profile); may cancel own bookings and update own profile fields
    where allowed.
- FR-007: Prevent creation or update of records that reference non-existent
  related records; return a clear validation error.
- FR-008: Enforce uniqueness rules described by each entity’s business
  constraints; conflicts return a clear message.
- FR-009: Support basic query filters per entity (e.g., status, date
  ranges, owning user) to enable typical workflows.
- FR-010: Return a consistent success and error response structure across
  all endpoints, including validation errors and authorization failures.
- FR-011: Document available fields for filtering and sorting for each entity.
- FR-012: Capture and return creation/last-change timestamps when applicable
  in detail and list views if the entity tracks them.
- FR-013: For user-facing data, restrict access so actors can only see
  what they are permitted to see (e.g., renters only see their records).
- FR-014: System behavior for deletes that would break referential
  integrity must be defined and enforced. [NEEDS CLARIFICATION: block vs cascade vs soft]
- FR-015: System must log key failures and rejected actions for audit
  purposes without exposing sensitive data to clients.

### Key Entities *(include if feature involves data)*

- User: Platform account with identity and role.
- Admin: Administrative role details tied to a user.
- Staff: Staff role details tied to a user.
- Renter: Customer profile and risk-related attributes tied to a user.
- Vehicle: Vehicle catalog attributes (make, model, year, specs).
- Station: Location where vehicles are kept/managed.
- VehicleAtStation: Assignment of a vehicle to a station with status.
- Booking: Reservation linking a renter to a vehicle-at-station.
- Rental: Active or completed rental derived from a booking.
- Payment: Payment record for fees/charges.
- Fee: Fee entries attached to bookings.
- Pricing: Pricing rules for vehicles (time-based, deposits, limits).
- KYC: Identity document submission and status for renters.
- Inspection: Pre/post rental inspection records.
- Report: Damage/issue report from an inspection.
- ReportsPhoto: Photo linked to an inspection/report.
- StaffAtStation: Staff assignment to a station.
- StaffTransfer: Staff station transfer request/record.
- Contract: Rental contract metadata and completion time.
- VehicleTransfer: Vehicle station transfer record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- SC-001: Endpoints exist and are documented for 100% of Phase 1
  entities (list, detail, create, update, delete each where applicable).
- SC-002: For the top 10 entities by usage, list responses return within
  2 seconds for default page sizes under typical load.
- SC-003: Validation failures and authorization errors return consistent
  structured responses across 100% of endpoints.
- SC-004: Referential integrity violations are blocked with clear
  messages; post-deploy audits detect 0 invalid references introduced via
  CRUD operations.
- SC-005: Role-based access rules prevent unauthorized access in all
  tested scenarios for admin, staff, and renter roles.

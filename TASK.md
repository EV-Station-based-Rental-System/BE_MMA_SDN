**Context**

- Repo language/framework: **NestJS** (TypeScript) with **MongoDB via Mongoose**.
- Source of truth for data model: **DBML** file at DBML_PATH (replace with actual path, e.g. ./db/schema.dbml).
- Goal: **Make the codebase conform to the DBML** (collections, fields, enums, relations, indexes, validation), then open a PR with a clear summary and tests.

**You (Codex) must:**

- Work incrementally in a feature branch.
- Generate/adjust Mongoose schemas, DTOs, validators, services, controllers, indexes, and tests to match the DBML.
- Produce a migration playbook and scripts for indexes/field renames.
- Keep changes organized into focused commits.
- Open a PR with a complete explanation of what changed and why.

---

**0) Setup & Branch**

1. Create and checkout a new branch:

- Branch name: feat/align-to-dbml

1. Ensure Node/pnpm scripts are available; if missing, add:

- "lint", "format", "test", "start:dev", "sync-indexes".

5. Add dev deps if not present:

- @dbml/core (parse DBML)
- @nestjs/swagger, class-transformer, class-validator
- mongodb (if any direct scripts needed)
- Testing: jest, ts-jest, @types/jest, supertest (if e2e)

Commit: chore: create branch and ensure tooling for DBML parsing and tests

---

**1) Parse DBML → Target Model Spec (single source of truth)**

1. Locate DBML at DBML\*PATH. If not found, search \*\*/\_.dbml and use the file that contains the enums and tables listed by the user (e.g., users, renters, vehicles, vehicle_at_stations, bookings, fees, payments, rentals, contracts, signatures, inspections, reports, reports_photo, kycs, pricings, vehicle_transfers, staff_transfers, etc.).
2. Add a script tools/dbml-to-spec.ts that:

- Uses @dbml/core to parse the DBML.
- Produces docs/model-spec.json and docs/model-spec.yml containing, for each Table/Enum:

- collectionName (pluralized, lower_snake or lowerCamel—match project convention)
- fields: name, dbmlType, tsType, required, default, notes
- enums: values
- indexes: simple/compound/unique
- relations: ref targets (collection + field), onDelete behavior (note for service-layer enforcement)

4. **Type mapping rules** (apply consistently):

- INT → number (but **\_ids are ObjectId**)
- VARCHAR, TEXT, NVARCHAR → string
- timestamptz, datetime, datetime2 → Date
- DOUBLEPRECISION → number
- NUMERIC(18,2), decimal(10,2) → prefer mongoose.Schema.Types.Decimal128 (or number if Decimal128 not yet used; document decision)
- UNIQUEIDENTIFIER → ObjectId (Mongo)
- defaults: SQL now() → Date.now

6. **Enum mapping**: Mongoose string enums + exported TS union type (or enum).
7. **Relationship mapping**:

- 1:N → child holds parent: ObjectId with index; populateable.
- 1:1 → unique ref on the child (e.g., contract.rental: ObjectId with unique: true).
- N:M with attributes (e.g., vehicle_at_stations, staff_at_stations, transfers) → **join collections**.

9. Detect and **normalize DBML typos** (record in the spec under fixes):

- Keep a fixes section listing any such corrections to apply in code and (optionally) back to the DBML in a small follow-up commit.

Commit: docs: generate model spec from DBML (json + yaml)

---

**2) Inventory Current Code → Current Model Map**

1. Scan src/\*\* for:

- Mongoose schemas (@Schema classes, .schema.ts files)
- DTOs (create/update/query), validators
- Services and controllers per resource
- Index definitions (schema.index(...))
- Swagger/OpenAPI decorators
- Any aggregation pipelines using field names

3. Emit docs/current-model-map.json with the same shape as model-spec.json for diffing.

Commit: chore: scan codebase and emit current model map

---

**3) Compute a Diff Plan**

Generate docs/model-diff.md summarizing, per collection:

- **Missing collections** to add.
- **Extra collections** to keep/remove (mark as legacy if needed).
- **Field diffs**: missing fields, extra fields, wrong types, wrong required/default.
- **Enum diffs**: missing/extra values; casing differences.
- **Index diffs**: missing/extra/incorrect uniqueness or compound order.
- **Relation diffs**: ref missing or pointing to wrong collection; 1:1 uniqueness missing.
- **Naming diffs**: snake_case vs camelCase; keep a single convention (prefer existing project convention). If renaming, add migration notes.

Commit: docs: add model diff plan

---

**4) Apply Schema Changes (Mongoose)**

For each collection in the DBML, ensure a schema exists under src/**/schemas. Do **not\*\* delete legacy fields yet; prefer additive changes + migration notes.

Implement/adjust:

- Fields with { type, required, default }
- Enums as enum: [...]
- Relations as Types.ObjectId with ref
- Indexes via Schema.index(...), including compound and unique
- timestamps option for tables that have created/updated fields; if DBML uses explicit timestamps, map them via timestamps: { createdAt: '...', updatedAt: '...' }
- 1:1 uniqueness via unique: true on the referencing field

**Table-specific reminders (from DBML):**

- users + renters/staff/admins: 1:1 link by user_id → use user: ObjectId with unique: true in each sub-collection.
- vehicle_at_stations: join collection (vehicle, station, start_time, end_time, status). Create DBML indexes:

- { vehicle: 1, start_time: 1 } unique
- { vehicle: 1, end_time: 1 }
- { station: 1, end_time: 1 }

- bookings: refs { renter, vehicleAtStation, verified_by_staff? }. Status + verification enums.
- fees: **DBML shows unique index on booking_id**; implement fee.booking with unique: true. (Document tradeoffs if multiple fee rows are desired later.)
- payments: DBML relation fees.fee_id < payments.payment_id implies 1:1; map as payment.fee: ObjectId with unique: true. (Do **not** reuse \_id; just reference uniquely.)
- rentals: unique ref to booking; ref to vehicle.
- contracts: unique ref to rental. Provider enum, version default = 1.
- signatures: ref to contract; include signature_event enum (pickup/dropoff), signature_type enum (drawn/typed/digital_cert), cert fields, indexes on contract.
- inspections: ref to rental, type enum (pre_rental/post_rental), unique composite (rental, type).
- reports and reports_photo: keep **separate** collections to match DBML. reports_photo references report. Add index on inspection in reports, and on report in reports_photo.
- kycs: ref to renter, enums for type and status.
- pricings: ref to vehicle, money fields, compound unique (vehicle, effective_from).
- vehicle_transfers and staff_transfers: join collections with the statuses and staff/admin refs; add indexes listed in DBML.

Commit (per area, multiple):

- feat(schema): add/align users + renters/staff/admins
- feat(schema): add/align vehicles + vehicle_at_stations (indexes, enums)
- feat(schema): add/align bookings/fees/payments
- feat(schema): add/align rentals/contracts/signatures
- feat(schema): add/align inspections/reports/reports_photo
- feat(schema): add/align kycs/pricings/transfers

---

**5) DTOs, Validation, Controllers, Services**

1. For each resource, ensure DTOs exist with class-validator and class-transformer decorators matching the schema:

- Required fields, enum validation, number ranges (e.g., risk_score 0–100).

3. Update controllers/services CRUD to handle:

- New required fields and enums
- Relations (accept ids as strings; validate ObjectId format)
- Business rules implied by DBML (e.g., unique deposit/fee per booking if that’s enforced)

5. Where queries rely on old names, update aggregations and .populate() paths.

Commit: feat(apis): align DTOs, controllers, services with DBML

---

**6) Index Sync & Data Migration Aids**

1. Add src/scripts/sync-indexes.ts that imports all models and calls Model.syncIndexes(); wire to pnpm run sync-indexes.
2. Create docs/migration-playbook.md explaining:

- Field renames
- New required fields and safe defaults
- 1:1 uniqueness constraints being introduced
- Steps to backfill data

4. If necessary, add minimal **one-off** migration scripts under src/scripts/migrations/\*.ts to:

- Rename enum values
- Copy/rename fields
- Create placeholder values for new required fields

Commit:

- chore: index sync script
- docs: migration playbook
- chore: add migration helpers

---

**7) OpenAPI / Swagger**

1. Ensure all controllers have @ApiTags, DTOs have @ApiProperty.
2. Expose enums in Swagger (use TS enum or as const + union types and annotate).
3. Confirm the OpenAPI JSON renders the new fields and relations.

Commit: docs(api): update swagger annotations to reflect DBML

---

**8) Tests**

1. Update/create unit tests for schemas (enum validation, required fields).
2. Service tests covering:

- Creating linked documents (e.g., booking → rental → contract)
- Enforcing unique indexes (expect duplicate errors)
- Aggregations/populates for common queries (e.g., current vehicles at station)

4. e2e tests for critical flows (optional but preferred).

Commit: test: add/align tests to DBML-conformant behavior

---

**9) Lint, Format, Build**

- Run lint/format and fix any issues.
- Ensure project builds and tests pass.
- Ensure pnpm run sync-indexes completes successfully against a local dev DB.

Commit: chore: lint/format/build green

---

**10) PR Creation**

1. Push branch.
2. Open PR titled: **“Align data model to DBML (NestJS + Mongoose)”**
3. PR body should include:

## Summary

This PR aligns the codebase to the DBML at DBML_PATH.

## Highlights

- Added/updated schemas for: users, renters, staff, admins, vehicles, vehicle_at_stations, bookings, fees, payments, rentals, contracts, signatures, inspections, reports, reports_photo, kycs, pricings, vehicle_transfers, staff_transfers.

- Implemented enums, required fields, defaults, and indexes (including compound and unique).

- Mapped relations: 1:N via refs, 1:1 via unique refs, N:M via join collections.

- Updated DTOs, services, controllers, and Swagger docs.

- Added `sync-indexes` script and migration playbook.

## Breaking/Behavioral Changes

- Enforced unique fee per booking (per DBML unique index). If multiple fees are desired, we can relax later.

- Introduced 1:1 uniqueness for contract↔rental and rental↔booking.

## Migration Guide

- See `docs/migration-playbook.md`.

- Run `pnpm run sync-indexes` post-deploy.

- Use provided scripts in `src/scripts/migrations/` if needed.

## Verification

- `pnpm run test` passes.

- Swagger reflects new models.

- Manual smoke tested: creating booking→rental→contract→signatures; vehicle placement queries; transfers.

Commit: (on merge) none—PR open.

---

**Conventions & Gotchas (apply throughout)**

- Use existing project naming conventions (camelCase in code). If DBML uses snake_case, normalize in code but keep Mongo field names consistent—**do not** silently break APIs. If renames are required, document and add migration scripts.
- Money fields: Prefer Decimal128 and document if falling back to number.
- Timestamps: If DBML explicitly names timestamp fields, map through timestamps options or explicit props so they match names.
- Relations: Always index ref fields used in queries and define compound indexes exactly as per DBML.
- Do **not** delete legacy collections/fields in this PR; mark them as deprecated and add TODOs for removal in a future cleanup.
- Keep commits small and descriptive.

---

**Acceptance Criteria (for you, Codex)**

- ✅ docs/model-spec.(json|yml) generated from DBML
- ✅ docs/current-model-map.json generated from code
- ✅ docs/model-diff.md explains all diffs
- ✅ All Mongoose schemas, DTOs, services, controllers match DBML
- ✅ Indexes (including compound/unique) exist and sync
- ✅ Swagger updated; tests pass
- ✅ Migration playbook and scripts exist
- ✅ PR opened with complete summary

**Environment Note:** Use process.env.MONGO_URI for scripts. Do not hardcode connection strings.

**DBML Path Placeholder:** Replace DBML_PATH with the real path before running.

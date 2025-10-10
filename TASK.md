EV Station Rental System — CRUD Roadmap (NestJS + MongoDB)
This document provides:
a commit-by-commit prompt for OpenAI Codex to scaffold and implement CRUD APIs using Nest CLI, reusing repo conventions from AGENTS.md and existing models under src/models.

2) Commit-by-Commit Prompt for Codex (Nest CLI + CRUD)
Context: NestJS + MongoDB. Follow AGENTS.md (guards, DTO validation, Swagger, error handling).
If a schema already exists in src/models, reuse it and only create module/controller/service.
All new feature modules live under src/modules/*.
________________________________________
Commit 1 — Bootstrap feature modules & shared utilities
Message: chore: scaffold feature modules and shared dto/utils
Actions:
npx nest g module modules/stations && npx nest g controller modules/stations --flat && npx nest g service modules/stations --flat
npx nest g module modules/vehicles && npx nest g controller modules/vehicles --flat && npx nest g service modules/vehicles --flat
npx nest g module modules/vehicle-at-stations && npx nest g controller modules/vehicle-at-stations --flat && npx nest g service modules/vehicle-at-stations --flat
npx nest g module modules/vehicle-status-logs && npx nest g controller modules/vehicle-status-logs --flat && npx nest g service modules/vehicle-status-logs --flat
npx nest g module modules/staff-station-assignments && npx nest g controller modules/staff-station-assignments --flat && npx nest g service modules/staff-station-assignments --flat
npx nest g module modules/contracts && npx nest g controller modules/contracts --flat && npx nest g service modules/contracts --flat
npx nest g module modules/inspections && npx nest g controller modules/inspections --flat && npx nest g service modules/inspections --flat
npx nest g module modules/issue-reports && npx nest g controller modules/issue-reports --flat && npx nest g service modules/issue-reports --flat
npx nest g module modules/pricing-rules && npx nest g controller modules/pricing-rules --flat && npx nest g service modules/pricing-rules --flat
npx nest g module modules/peak-hour-windows && npx nest g controller modules/peak-hour-windows --flat && npx nest g service modules/peak-hour-windows --flat
npx nest g module modules/analytics && npx nest g controller modules/analytics --flat && npx nest g service modules/analytics --flat
Create shared pagination helpers:
src/common/dto/pagination.dto.ts, src/common/utils/pagination.ts.
Check: project builds.
________________________________________
Commit 2 — Schemas: Station & Vehicle
Message: feat(models): add Station and Vehicle schemas with enums and timestamps
Files: src/models/station.schema.ts, src/models/vehicle.schema.ts, update src/models/index.ts.
Notes: add @Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }).
________________________________________
Commit 3 — Schemas: VehicleAtStation & VehicleStatusLog
Message: feat(models): add VehicleAtStation and VehicleStatusLog schemas
Files: src/models/vehicle-at-station.schema.ts, src/models/vehicle-status-log.schema.ts
Relations: refs to Station, Vehicle, User (for by_staff).
________________________________________
Commit 4 — Schemas: StaffStationAssignment, Contract, Inspection
Message: feat(models): add StaffStationAssignment, Contract, and Inspection schemas
Files: src/models/staff-station-assignment.schema.ts, src/models/contract.schema.ts, src/models/inspection.schema.ts
Notes: include enums for status, type, money/time fields.
________________________________________
Commit 5 — Schemas: IssueReport, PricingRule, PeakHourWindow
Message: feat(models): add IssueReport, PricingRule, and PeakHourWindow schemas
Files: src/models/issue-report.schema.ts, src/models/pricing-rule.schema.ts, src/models/peak-hour-window.schema.ts.
________________________________________
Commit 6 — Register schemas in feature modules
Message: chore(modules): register mongoose schemas via forFeature
Action: In each modules/*/*.module.ts, register schemas with MongooseModule.forFeature([...]).
Ensure modules are imported in AppModule. Build should succeed.
________________________________________
Commit 7 — CRUD: Station
Message: feat(stations): CRUD endpoints with pagination, guards, and swagger
Endpoints: POST /stations, GET /stations, GET /stations/:id, PATCH /stations/:id, DELETE /stations/:id
Access: Admin-only (Jwt + Roles).
DTOs: create-station.dto.ts, update-station.dto.ts.
________________________________________
Commit 8 — CRUD: Vehicle (with filters)
Message: feat(vehicles): CRUD with filters (q, status, type) and pagination
Access: Admin + Staff write, Renter read (follow AGENTS.md).
Query: ?q, ?status, ?type, ?page, ?limit.
________________________________________
Commit 9 — CRUD: VehicleAtStation
Message: feat(vehicle-at-stations): CRUD to manage vehicles assigned to stations
Validation: ensure vehicle and station exist; keep active pair uniqueness; support ?stationId/?vehicleId filters.
________________________________________
Commit 10 — CRUD: VehicleStatusLog + status update helper
Message: feat(vehicle-status-logs): CRUD and /vehicles/:id/status helper
Add endpoint: POST /vehicles/:id/status with { to_status, note? } → update Vehicle.status and create a VehicleStatusLog.
List history: GET /vehicle-status-logs?vehicleId=.
________________________________________
Commit 11 — CRUD: StaffStationAssignment (Assign Staff to Station)
Message: feat(staff-station-assignments): CRUD and date-window validations
Rules: start_date < end_date (if provided); is_primary unique per staff; Admin-only.
________________________________________
Commit 12 — CRUD: Contract & Inspection (Handover/Receive)
Message: feat(contracts, inspections): CRUD and relations for handover/receive flow
Contract: unique code, links to renter/vehicle/stations.
Inspection: type (pre_rental|post_rental), created_by staff.
Filter: GET /inspections?contractId= returns both pre/post.
________________________________________
Commit 13 — CRUD: IssueReport with workflow
Message: feat(issue-reports): CRUD with status workflow (open→in_progress→resolved)
Default: status=open; PATCH only allows valid transitions.
________________________________________
Commit 14 — CRUD: PricingRule & PeakHourWindow (Manage Pricing)
Message: feat(pricing): CRUD pricing rules and peak-hour windows (admin only)
Validations: weekday in [0..6], start_time < end_time; scope logic for PricingRule.
________________________________________
Commit 15 — Analytics (read-only)
Message: feat(analytics): revenue, staff performance, and risky customers endpoints
Endpoints:
•	GET /analytics/revenue?stationId?&from?&to? → aggregate from contracts, sum price_actual || price_plan by day.
•	GET /analytics/staff-performance?stationId?&from?&to? → { staffId, contracts_count, issues_resolved, on_time_ratio, avg_rating? }.
•	GET /analytics/risky-customers?limit=20 → list renters with a simple risk_score (overdue contracts + unresolved issues). Mark as placeholder.
________________________________________
Commit 16 — Vehicle history view
Message: feat(vehicles): GET /vehicles/:id/history aggregates logs, inspections, and issues
Return: { vehicle, statusLogs[], inspections[], issueReports[] }.
________________________________________
Commit 17 — Auth & Swagger polish
Message: chore(auth): apply JwtAuthGuard and RolesGuard; Swagger polish across modules
Access policy:
•	Admin-only: stations, staff-station-assignments, pricing-rules, peak-hour-windows.
•	Admin + Staff: vehicles, vehicle-at-stations, vehicle-status-logs, contracts, inspections, issue-reports.
Add @ApiTags, @ApiBearerAuth(), standard responses.
________________________________________
Commit 18 — E2E smoke tests / HTTP examples
Message: test(e2e): add smoke tests for key flows
Flows: status update + log, staff assignment, contract + pre/post inspection, revenue analytics.
________________________________________
Commit 19 — Lint, format, docs
Message: chore: lint/format and add README snippets for new endpoints
Run pnpm run lint && pnpm run format.
Add short cURL samples per module in README.md (or docs/USECASES.md).
________________________________________
Controller & Service Conventions (for all CRUD modules)
•	Routes: plural kebab-case (e.g., /vehicle-at-stations).
•	Endpoints: POST /, GET /, GET /:id, PATCH /:id, DELETE /:id.
•	Pagination: ?page (default 1), ?limit (default 20, max 100).
•	Filtering: ?q on sensible fields (name/code), plus module-specific filters.
•	DTOs: class-validator with whitelist/transform (ValidationPipe per AGENTS.md).
•	Errors: use the project’s custom exceptions.
•	Docs: @ApiTags, @ApiOkResponse, etc.
•	Schemas: use refs via Types.ObjectId, timestamps as created_at/updated_at.
________________________________________
Minimal Field Reference (exact names unless an identical schema already exists)
•	Station: name, code, address?, lat?, lng?, is_active
•	Vehicle: vin_or_code, type, brand?, model?, battery_capacity_kwh?, odo_km?, status
•	VehicleAtStation: station, vehicle, since?, note?
•	VehicleStatusLog: vehicle, by_staff?, from_status?, to_status, note?
•	StaffStationAssignment: staff, station, start_date, end_date?, is_primary?
•	Contract: code, renter, vehicle, pickup_station, dropoff_station?, status, start_time, end_time_plan, end_time_actual?, price_plan, price_actual?
•	Inspection: contract, vehicle, type, battery_percent?, photos?[], notes?, created_by?
•	IssueReport: vehicle, reported_by?, type, severity?, status, notes?
•	PricingRule: name, scope, station?, vehicle_type?, base_rate, per_km?, per_hour?, weekend_multiplier?, holiday_multiplier?, effective_from, effective_to?
•	PeakHourWindow: station?, weekday, start_time, end_time, multiplier
________________________________________
Delivery goal: after each commit the app must build and run, new modules appear in Swagger /api, and authorization behavior matches AGENTS.md.


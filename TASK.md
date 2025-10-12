EV Station Rental System — CRUD Roadmap (NestJS + MongoDB)
This document is scoped to Vehicle and Station APIs only and aligns with the current schemas under src/models. Future modules (bookings, inspections, pricing, analytics, etc.) are out of scope for now and listed as backlog at the end.

2) Commit-by-Commit Prompt for Codex (Nest CLI + CRUD)
Context: NestJS + MongoDB. Follow AGENTS.md (guards, DTO validation, Swagger, error handling).
If a schema already exists in src/models, reuse it and only create module/controller/service.
All new feature modules live under src/modules/*.
________________________________________
Commit 1 — Bootstrap feature modules & shared utilities
Message: chore: scaffold stations and vehicles modules and shared dto/utils
Actions:
- npx nest g module modules/stations && npx nest g controller modules/stations --flat && npx nest g service modules/stations --flat
- npx nest g module modules/vehicles && npx nest g controller modules/vehicles --flat && npx nest g service modules/vehicles --flat
- Create shared pagination helpers: src/common/dto/pagination.dto.ts, src/common/utils/pagination.ts.
Notes:
- AppModule already registers all models via MongooseModule.forFeature(index). Do not re-register Station/Vehicle in the feature modules; just use @InjectModel.
Check: project builds.
________________________________________
Commit 2 — Schemas: Station & Vehicle (reuse existing)
Message: chore(models): confirm Station and Vehicle schemas and index export
Files: src/models/station.schema.ts, src/models/vehicle.schema.ts, src/models/index.ts (already present)
Notes:
- Timestamps follow AGENTS.md: @Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } }).
- Station fields: station_id (unique), name (required), address (required), latitude?, longitude?.
- Vehicle fields: vehicle_id (unique), make (required), model (required), model_year (required), category (default 'EV'), battery_capacity_kwh?, range_km?, vin_number? (unique).
________________________________________
Commit 3 — CRUD: Station
Message: feat(stations): CRUD endpoints with pagination, guards, and swagger
Endpoints: POST /stations, GET /stations, GET /stations/:id, PATCH /stations/:id, DELETE /stations/:id
Access: Admin-only (Jwt + Roles) per AGENTS.md.
DTOs:
- create-station.dto.ts → { name: string; address: string; latitude?: number; longitude?: number }
- update-station.dto.ts → partial of the above
Notes:
- No code/is_active fields in the model; do not include them in DTOs.
- Use :id as Mongo _id in routes; station_id remains a unique field in documents.
________________________________________
Commit 4 — CRUD: Vehicle (with filters)
Message: feat(vehicles): CRUD with filters and pagination
Endpoints: POST /vehicles, GET /vehicles, GET /vehicles/:id, PATCH /vehicles/:id, DELETE /vehicles/:id
Access: Admin + Staff write, Renter read (follow AGENTS.md policies as available).
Query filters:
- ?q searches make, model, vin_number
- ?category filters by category
- ?model_year filters by exact model_year
- ?min_battery_kwh, ?min_range_km for lower bounds
- ?page, ?limit for pagination
DTOs:
- create-vehicle.dto.ts → { make: string; model: string; model_year: number; category?: string; battery_capacity_kwh?: number; range_km?: number; vin_number?: string }
- update-vehicle.dto.ts → partial of the above
Notes:
- Model does not have status/odo/type; do not add them.
- Use :id as Mongo _id in routes; vehicle_id remains a unique field in documents.
________________________________________
Commit 5 — Auth & Swagger polish (scoped)
Message: chore(auth): apply JwtAuthGuard and RolesGuard in stations/vehicles; Swagger polish
Actions:
- Add @ApiTags('stations'|'vehicles'), @ApiBearerAuth(), and success/error response decorators per AGENTS.md.
- Document DTOs and query params; reflect actual payloads (no extraneous fields).
________________________________________
Backlog (out of scope for now)
- VehicleAtStation, VehicleStatusLog, StaffStationAssignment, Contracts, Inspections, IssueReports, PricingRule, PeakHourWindow, Analytics, Vehicle history view, E2E tests.
________________________________________
Controller & Service Conventions (for all CRUD modules)
• Routes: plural kebab-case (e.g., /stations, /vehicles).
• Endpoints: POST /, GET /, GET /:id, PATCH /:id, DELETE /:id.
• Pagination: ?page (default 1), ?limit (default 20, max 100).
• Filtering: ?q on sensible fields (name/make/model), plus module-specific filters above.
• DTOs: class-validator with whitelist/transform (ValidationPipe per AGENTS.md).
• Errors: use the project’s custom exceptions.
• Docs: @ApiTags, @ApiOkResponse, etc.
• Schemas: use refs via Types.ObjectId, timestamps as created_at (no updated_at).
________________________________________
Minimal Field Reference (exact names from current schemas)
• Station: station_id, name, address, latitude?, longitude?
• Vehicle: vehicle_id, make, model, model_year, category, battery_capacity_kwh?, range_km?, vin_number?
________________________________________
Delivery goal: after each commit the app must build and run, stations/vehicles modules appear in Swagger /api, and authorization behavior matches AGENTS.md for these modules.


# BE_MMA_SDN – Agent Guide

This is a NestJS + MongoDB backend for an electric vehicle rental platform with station-based operations. The system manages the full rental lifecycle: bookings, vehicle assignments at stations, staff operations, contracts, inspections, payments, and reporting.

## Module Layout & Scaffolding
- Use the Nest CLI to scaffold every feature under `src/modules/<feature>`; the `VehicleModule`, `VehicleStationModule`, and `StationModule` show the expected structure of `dto/`, `<feature>.controller.ts`, `<feature>.service.ts`, and `<feature>.module.ts`.
- Use plural file names for primary domain entities (e.g., `vehicles.controller.ts`, `stations.controller.ts`) and singular for relationship entities (e.g., `vehicle_station.controller.ts`, `staff_at_station.controller.ts`). Reuse absolute imports from `src/...` to stay aligned with the project's `tsconfig`.
- Controllers stay thin and delegate data access to services. Services inject repositories with `@InjectModel(...)` after the schema is registered.
- Register the module inside `AppModule` once the providers are ready so the feature is part of the global dependency graph.
- A generated module should look like:
```text
src/modules/vehicles
├── dto
│   ├── create-vehicle.dto.ts
│   └── update-vehicle.dto.ts
├── vehicles.controller.ts
├── vehicles.module.ts
└── vehicles.service.ts
```

## DTO Validation & Transformation
- `src/main.ts` enables a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform`, so DTOs must explicitly declare every accepted property to avoid request rejections.
- Use `class-validator` decorators matching the domain types, for example `@IsString`, `@IsNumber`, `@IsEnum(StatusVehicleAtStation)`, and `@IsOptional()`. Reuse enums from `src/common/enums` instead of redefining literals.
- Rely on `class-transformer` helpers such as `@Type(() => Date)` when accepting dates or numbers (see `CreateVehicleStationDto`) to match the pipe's transformation step.
- Decorate every field with `@ApiProperty` or `@ApiPropertyOptional` so Swagger stays in sync with the runtime payloads.
- Copy the `PartialType` pattern from `UpdateVehicleDto` and `UpdateStationDto` for update DTOs to inherit validation rules.

## Swagger Response Patterns
- Mirror the controllers in `vehicles`, `vehicle_station`, and `stations`: pair each handler with `@ApiOperation` plus the matching success decorator (`@ApiCreatedResponse`, `@ApiOkResponse`, `@ApiNoContentResponse`, etc.) and keep return types aligned with the service response (`ResponseDetail`, `ResponseList`, `ResponseMsg`).
- **HTTP Status Code Defaults**: NestJS returns specific status codes by default for each HTTP method. Align Swagger decorators with these defaults:
  - `@Post()` → **201 Created** → use `@ApiCreatedResponse`
  - `@Get()`, `@Put()`, `@Patch()` → **200 OK** → use `@ApiOkResponse`
  - `@Delete()` → **200 OK** (or override to 204 with `@HttpCode(204)` + `@ApiNoContentResponse`)
- To override default status codes, use `@HttpCode(statusCode)` from `@nestjs/common` and update the corresponding Swagger decorator to match.
- Document authentication with `@ApiBearerAuth()` whenever `JwtAuthGuard` protects a route, as done in `VehicleStationController` and `StationController`.
- Reuse shared error response classes (`ResponseBadRequest`, `ResponseUnauthorized`, `ResponseForbidden`, `ResponseNotFound`, `ResponseConflict`, `ResponseInternalError`) inside the corresponding decorators so Swagger advertises the normalized error shape.
- Expose query parameters explicitly with `@ApiQuery`, following the pagination examples already present in the station and vehicle modules.
- Keep controllers focused on returning the response wrapper instances produced by the services; avoid returning raw documents directly.

## Persistence & Schemas
- Place MongoDB schemas in `src/models/<feature>.schema.ts` and decorate them with `@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })`. The `Station` and `VehicleAtStation` schemas show the required defaults (`is_active`, ObjectId references, etc.).
- Generate schemas with the Nest CLI and define properties with `@Prop`. Minimal example:
```ts
@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })
export class Fleet {
  @Prop({ required: true, type: String })
  name: string;
}
export const FleetSchema = SchemaFactory.createForClass(Fleet);
```
- Export new schemas through `src/models/index.ts`; `AppModule` pulls this array into `MongooseModule.forFeature(index)` so every model is globally available.
- Feature modules call `MongooseModule.forFeature([{ name: Fleet.name, schema: FleetSchema }])` (or multiple entries like `VehicleStationModule`) and services inject them with `@InjectModel`.
- When you need aggregation, reuse the shared pagination helpers (`applyCommonFiltersMongo`, `applySortingMongo`, `applyPaginationMongo`, `applyFacetMongo`) just like `VehicleService` and `VehicleStationService`.

## Guards, Strategies & Access Control
- Secure endpoints with `@UseGuards(JwtAuthGuard, RolesGuard)` and scope access via `@Roles(...)` using the `Role` enum from `src/common/enums/role.enum`.
- Strategies live under `src/modules/auth/strategies`. Add new Passport strategies there and wire them through `AuthModule` if a feature introduces a new auth flow.
- `@ApiBearerAuth()` must accompany guarded routes so Swagger advertises the JWT requirement.
- Throw project-specific exceptions from `src/common/exceptions` (`NotFoundException`, `ForbiddenException`, etc.) to keep error formatting consistent.

## Shared Utilities & Error Model
- `HttpErrorInterceptor` (registered in `src/main.ts`) shapes every error as `{ statusCode, message, errorCode? }`. The custom exceptions in `src/common/exceptions` extend this format—reuse them instead of Nest defaults.
- Success payloads should go through the response wrappers in `src/common/response` (`ResponseDetail`, `ResponseList`, `ResponseMsg`). They already integrate with the pagination helpers.
- `src/common/utils/helper.ts` centralizes hashing (`hashPassword`, `comparePassword`) and primitive converters (`toNumber`, `toBoolean`, etc.); import these helpers rather than duplicating logic.
- Reuse the global `MailModule`/`MailService` and `RedisModule`/`REDIS_CLIENT` provider when a feature needs email notifications or Redis access.

## Configuration & Environment
- `AppModule` loads configuration via the global `ConfigModule`. Provide an `.env` with at least `MONGO_URI`, `JWT_SECRET_KEY`, `JWT_EXPIRES_IN`, `GMAIL_USER`, `GMAIL_PASS`, `MAIL_HOST`, `MAIL_PORT`, and `REDIS_URL`.
- Missing Gmail or Redis values will prevent the corresponding providers from bootstrapping; supply development-safe placeholders if the integrations are optional for your local work.
- Useful scripts: `pnpm run start:dev` (API on port `3001`, Swagger at `/api`), `pnpm run lint`, `pnpm run format`, `pnpm run test`, and `pnpm run test:e2e`.

## CLI Walkthrough: Building a Module Like Vehicles
1. `nest g module modules/fleet`
2. `nest g controller modules/fleet --flat --no-spec`
3. `nest g service modules/fleet --flat --no-spec`
4. `nest g class modules/fleet/dto/create-fleet.dto --flat --no-spec`
5. `nest g class modules/fleet/dto/update-fleet.dto --flat --no-spec`
6. `nest g class models/fleet.schema --flat --no-spec`
7. Open `src/models/fleet.schema.ts`, add `@Schema({ timestamps: { createdAt: "created_at", updatedAt: false } })`, declare `@Prop` fields, and export `Fleet` plus `FleetSchema`.
8. Append `{ name: Fleet.name, schema: FleetSchema }` to `src/models/index.ts` and import `MongooseModule.forFeature([{ name: Fleet.name, schema: FleetSchema }])` into `FleetModule`.
9. Add `FleetModule` to the `imports` array in `src/app.module.ts`, implement service methods that return `ResponseDetail`/`ResponseList` and throw custom exceptions, then copy the Swagger decorators, guards, and DTO validation patterns from `VehicleController`/`StationController`.

Expected layout after scaffolding:
```text
src/modules/fleet
├── dto
│   ├── create-fleet.dto.ts
│   └── update-fleet.dto.ts
├── fleet.controller.ts
├── fleet.module.ts
└── fleet.service.ts
src/models/fleet.schema.ts
```

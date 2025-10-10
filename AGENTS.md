# BE_MMA_SDN – Agent Guide

This is a NestJS + MongoDB backend for an electric vehicle rental platform with station-based operations. The system manages the full rental lifecycle: bookings, vehicle assignments at stations, staff operations, contracts, inspections, payments, and reporting.

## Architecture in one glance

- `src/main.ts` bootstraps NestJS with CORS, global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) and the shared `HttpErrorInterceptor`; every DTO must align with exposed fields or validation will reject requests.
- `AppModule` wires global `ConfigModule` (`common/config/config.ts`) and creates a single Mongoose connection; all schemas are registered through `models/index.ts`, so new collections must be exported there to be reachable via `@InjectModel`.
- Cross-cutting assets live in `src/common`:
  - `exceptions/*` wrap Nest `HttpException` with a project-specific JSON payload via `BaseException`.
  - `guards` implement Passport guards (e.g., `LocalGuard`, `JwtAuthGuard`); strategies live under `modules/**/strategies`.
  - `utils/helper.ts` centralizes bcrypt hashing; reuse instead of duplicating crypto logic.

## Domain patterns

- Persistence uses `@nestjs/mongoose` schemas in `src/models/*.schema.ts`. Follow the existing convention: decorate classes with `@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })`, type ObjectId references with `mongoose.Schema.Types.ObjectId`, and create the schema via `SchemaFactory.createForClass`. Example: `models/renter.schema.ts` links to `User` and adds renter-specific fields.
- Enumerations that drive state machines (contracts, transfers, fees, etc.) live in `common/enums`; import these enums instead of re-creating literals so DTO decorators (`@IsEnum`) stay in sync with persistence.
- When adding feature modules, mirror the auth layout (`modules/auth`): place DTOs under `dto/`, wire providers in `<feature>.module.ts`, and expose controller logic from `<feature>.controller.ts`. Inject repositories with `@InjectModel(<Schema>.name)` after registering the schema in `AppModule` or the module’s `forFeature` call.

## Authentication workflow

- Login uses the Passport `local` strategy (`LocalStrategy`) to resolve a user via `AuthService.validateUser`, which fetches `User` by email, verifies passwords with `comparePassword`, and enriches JWT payloads with role-specific data (`Admin`, `Staff`, `Renter`). Any new role should extend `BaseJwtUserPayload` in `common/utils/type.ts` and update the `switch` in `AuthService`.
- JWT issuance reads secrets from `ConfigService`; ensure `.env` defines `JWT_SECRET_KEY` and `JWT_EXPIRES_IN`. `JwtStrategy` validates tokens and re-checks account status through `AuthService.checkStatus`.

## Configuration & tooling

- Required environment variables (for local dev/tests): `MONGO_URI`, `JWT_SECRET_KEY`, `JWT_EXPIRES_IN`. The `prepare` script expects Husky/Doppler; when running locally without them, skip `pnpm run prepare` and provide an `.env` manually.
- Common commands:
  - `pnpm run start:dev` – watch mode server on port `3001` (Swagger at `/api`).
  - `pnpm run lint` / `pnpm run format` – lint and format via ESLint + Prettier (ESLint config tolerates some `@typescript-eslint/*` warnings).
  - `pnpm run test`, `pnpm run test:e2e` – Jest setup; tests currently scaffolded only.

## Contributor tips

- API docs rely on `@nestjs/swagger`; annotate DTOs with `@ApiProperty` like in `modules/auth/dto/*.ts` so Swagger stays descriptive.
- Because global validation strips unknown properties, add explicit DTO fields (and `@IsOptional()` where appropriate) before touching request bodies.
- Reuse custom exceptions (e.g., `NotFoundException`, `ForbiddenException`) instead of Nest defaults so the global interceptor can normalize responses.
- Absolute imports (`import ... from 'src/...';`) rely on the project’s `baseUrl` config—keep files under `src/` to preserve resolution.
- Swagger response docs should follow the auth module precedent:
  - Use the shared `{ msg: string }` contract via `MessageResponseDto` whenever a handler returns a confirmation message.
  - Document token payloads with `LoginResponseDto` (or a sibling DTO) rather than anonymous object schemas.
  - Error responses must describe the normalized `{ statusCode, message, errorCode? }` shape exposed by `BaseException`; keep the `errorCode` example `null` unless a specific code is emitted.

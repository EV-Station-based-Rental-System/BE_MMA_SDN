Task
Detect the return type of every HTTP route and add the correct OpenAPI response decorators (@nestjs/swagger) so the generated docs are accurate (including primitives like string, arrays, DTOs, unions, streams/files, and known error shapes). Do not change runtime logic.
Scope & Files
•	Controllers: src/**/*.controller.ts
•	DTOs: src/modules/**/dto/**/*.ts
•	Services called by controllers: src/**/*.service.ts
•	Enums: src/common/enums/**/*
•	Guards/interceptors/filters (for status codes/errors): src/common/**/* and src/**/*.{guard,interceptor,filter}.ts
Rules
1.	Add success response decorators that match the actual status code:
o	200 → @ApiOkResponse
o	201 (resource created) → @ApiCreatedResponse
o	204 (no body) → @ApiNoContentResponse
o	Respect @HttpCode(...) if present, and any custom response handling with @Res().
2.	Map return shape to schema:
o	DTO class → type: MyDto.
o	Array of DTOs → type: MyDto, isArray: true.
o	Primitive (e.g., string | number | boolean) → schema: { type: 'string' | 'number' | 'boolean' }.
If the controller returns raw text (not JSON), add @ApiProduces('text/plain').
o	Array of primitives → schema: { type: 'array', items: { type: 'string' | 'number' | 'boolean' } }.
o	Object literal (no DTO) → explicit schema: { type: 'object', properties: { ... }, example: { ... } }.
o	Unions/conditional → schema: { oneOf: [...] } using $ref: getSchemaPath(...) for DTOs. Import getSchemaPath and add @ApiExtraModels(...) as needed.
o	Streams/files/buffers → @ApiProduces('application/octet-stream') and document format: 'binary' where applicable.
3.	Add error response decorators for known exceptions thrown by the controller/service or global filters:
o	@ApiBadRequestResponse, @ApiUnauthorizedResponse, @ApiForbiddenResponse,
@ApiNotFoundResponse, @ApiConflictResponse, @ApiUnprocessableEntityResponse,
@ApiInternalServerErrorResponse
o	Use a consistent error schema (statusCode/message/error), matching the project’s normalized JSON error shape.
4.	Inference order for return types:
o	Prefer explicit TypeScript return type.
o	Otherwise, trace return this.someService.method(...) into the service to infer.
o	Use DTOs/enums and obvious return literals to deduce the shape.
o	If @Res() is used and body is constructed manually, document minimally and add a TODO.
5.	Do not change business logic. Only add/adjust decorators and related imports. Keep Prettier/ESLint happy.
Repository conventions to respect
•	DTOs already use @ApiProperty (keep/extend).
•	ValidationPipe strips unknown props; keep schemas aligned with DTOs.
•	Swagger UI path is /api; JSON/YAML endpoints should exist at /api-json and /api-yaml unless already customized. 
Concrete example (apply pattern across controllers)
If an endpoint returns a plain string (e.g., createAdmin() in AuthController returns "created"):
import { ApiCreatedResponse, ApiProduces } from '@nestjs/swagger';

@Post('register/admin')
@ApiProduces('text/plain') // only if response is raw text, not JSON
@ApiCreatedResponse({
  description: 'Admin created (plain string)',
  schema: { type: 'string', example: 'created' },
})
async createAdmin(@Body() body: AdminDto) {
  return this.authService.createAdmin(body);
}
If login returns a JWT payload DTO (e.g., LoginResponseDto):
import { ApiOkResponse } from '@nestjs/swagger';

@Post('login')
@ApiOkResponse({ description: 'JWT token', type: LoginResponseDto })
login(@Request() req) {
  return this.authService.login(req.user);
}
If an endpoint can return one of two DTOs:
import { ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

@ApiExtraModels(SuccessDto, ErrorDto)
@ApiOkResponse({
  schema: {
    oneOf: [
      { $ref: getSchemaPath(SuccessDto) },
      { $ref: getSchemaPath(ErrorDto) },
    ],
  },
})
Add representative error decorators if code throws specific Nest exceptions:
import { ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiBadRequestResponse({
  description: 'Validation error',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'integer', example: 400 },
      message: { type: 'string', example: 'email must be an email' },
      error: { type: 'string', example: 'Bad Request' },
    },
  },
})
@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
@ApiNotFoundResponse({ description: 'Resource not found' })
Implementation steps
1.	For each src/**/*.controller.ts method with @Get/@Post/@Put/@Patch/@Delete (etc.):
o	Infer status code and return type; add the matching success decorator.
o	If primitive raw text → add @ApiProduces('text/plain').
o	Add error decorators that reflect thrown exceptions or global filters.
2.	Ensure needed imports from @nestjs/swagger are added at file top:
o	ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse,
ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse,
ApiNotFoundResponse, ApiConflictResponse, ApiUnprocessableEntityResponse,
ApiInternalServerErrorResponse, ApiProduces, ApiExtraModels, getSchemaPath.
3.	Do not modify business logic or DTO fields beyond documentation.
4.	Provide unified diffs for each changed file with commit-sized edits, e.g.:
o	docs(swagger): annotate AuthController responses
o	docs(swagger): document error responses for BookingController
5.	If any return type cannot be confidently inferred, add:
o	Minimal @ApiOkResponse({ description: 'Undocumented shape' })
o	A // TODO: comment stating the uncertainty and the suspected type.
Acceptance criteria
•	Every controller method has at least one accurate success response decorator.
•	Known error cases are documented with appropriate error decorators.
•	Primitive/string endpoints are correctly shown (and marked text/plain when applicable).
•	Arrays, unions, and file/stream responses are correctly documented.
•	Build passes and Swagger UI at /api renders accurate schemas.


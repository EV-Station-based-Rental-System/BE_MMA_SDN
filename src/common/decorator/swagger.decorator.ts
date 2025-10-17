import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";
import { ResponseUnauthorized } from "src/common/response/error/response-unauthorized";
import { ResponseForbidden } from "src/common/response/error/response-forbidden";
import { ResponseNotFound } from "src/common/response/error/response-notfound";
import { ResponseConflict } from "src/common/response/error/response-conflict";
import { ResponseInternalError } from "src/common/response/error/response-internal-error";

export function ApiErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest }),
    ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized }),
    ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden }),
    ApiNotFoundResponse({ description: "Not found", type: ResponseNotFound }),
    ApiConflictResponse({ description: "Conflict", type: ResponseConflict }),
    ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError }),
  );
}

import { Controller, Post, UploadedFile, UseInterceptors, Body, UseGuards, ParseFilePipeBuilder, HttpStatus } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ImagekitService } from "./imagekit.service";
import { ResponseDetail } from "../response/response-detail-create-update";
import { ResponseBadRequest } from "../response/error/response-bad-request";
import { ResponseUnauthorized } from "../response/error/response-unauthorized";
import { ResponseForbidden } from "../response/error/response-forbidden";
import { ResponseInternalError } from "../response/error/response-internal-error";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorator/roles.decorator";
import { Role } from "../enums/role.enum";

@Controller("imagekit")
@Roles(Role.ADMIN, Role.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImagekitController {
  constructor(private readonly imagekitService: ImagekitService) {}

  @Post("upload/contract")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload contract image to ImageKit (folder: BE_SDN_MMA/contract)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Contract image file to upload",
        },
      },
      required: ["file"],
    },
  })
  @ApiOkResponse({ description: "Contract image uploaded successfully", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid file format or size", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  async uploadContract(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB for contracts
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileBuffer = file.buffer as Buffer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileName = file.originalname as string;

    return this.imagekitService.uploadContractImage(fileBuffer, fileName);
  }

  @Post("upload/after")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload after inspection image to ImageKit (folder: BE_SDN_MMA/after)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "After inspection image file to upload",
        },
      },
      required: ["file"],
    },
  })
  @ApiOkResponse({ description: "After image uploaded successfully", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid file format or size", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  async uploadAfter(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileBuffer = file.buffer as Buffer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileName = file.originalname as string;

    return this.imagekitService.uploadAfterImage(fileBuffer, fileName);
  }

  @Post("upload/before")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload before inspection image to ImageKit (folder: BE_SDN_MMA/before)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Before inspection image file to upload",
        },
      },
      required: ["file"],
    },
  })
  @ApiOkResponse({ description: "Before image uploaded successfully", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid file format or size", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  async uploadBefore(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileBuffer = file.buffer as Buffer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileName = file.originalname as string;

    return this.imagekitService.uploadBeforeImage(fileBuffer, fileName);
  }
}

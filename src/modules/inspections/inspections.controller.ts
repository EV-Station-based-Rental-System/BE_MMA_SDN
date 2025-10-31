import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { InspectionsService } from "./inspections.service";
import { CreateInspectionDto } from "./dto/createInspections.dto";
import { CompleteInspectionDto } from "./dto/completeInspection.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { ResponseMsg } from "src/common/response/response-message";
import { Inspection } from "src/models/inspections.schema";
import { Report } from "src/models/report.schema";
import { ReportsPhoto } from "src/models/reports_photo.schema";
import { StaffJwtUserPayload } from "src/common/utils/type";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiExtraModels, ApiOkResponse } from "@nestjs/swagger";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";

@ApiExtraModels(Inspection, Report, ReportsPhoto)
@Controller("inspection")
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiCreatedResponse({ description: "Inspection created", type: SwaggerResponseDetailDto(Inspection) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateInspectionDto })
  async create(@Body() createInspectionDto: CreateInspectionDto, @Req() req: { user: StaffJwtUserPayload }) {
    return this.inspectionsService.create(createInspectionDto, req.user);
  }

  @Post(":id/upload-photo")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  @ApiCreatedResponse({ description: "Photo uploaded successfully", type: SwaggerResponseDetailDto(ReportsPhoto) })
  @ApiErrorResponses()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        label: {
          type: "string",
          description: "Nhãn mô tả cho ảnh (ví dụ: Ảnh trước khi thuê, Ảnh sau khi trả, etc.) - Optional",
          example: "Ảnh trước khi thuê",
        },
        file: {
          type: "string",
          format: "binary",
          description: "Image file (jpg, jpeg, png, gif, webp) - Max 5MB",
        },
      },
      required: ["file"],
    },
  })
  async uploadPhoto(
    @Param("id") inspectionId: string,
    @Body("label") label: string,
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
    return this.inspectionsService.uploadPhoto(inspectionId, file, label);
  }

  @Get(":id/photos")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.RENTER)
  @ApiOkResponse({ description: "List of inspection photos", type: SwaggerResponseDetailDto(Array<ReportsPhoto>) })
  @ApiErrorResponses()
  async getPhotos(@Param("id") id: string) {
    return this.inspectionsService.getPhotos(id);
  }

  // TODO chỗ này cần sửa lại để ra cái report
  @Post(":id/complete")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiCreatedResponse({ description: "Inspection completed", type: SwaggerResponseDetailDto(Object) })
  @ApiErrorResponses()
  @ApiBody({ type: CompleteInspectionDto })
  async completeInspection(@Param("id") id: string, @Body() completeDto: CompleteInspectionDto) {
    return this.inspectionsService.completeInspection(id, completeDto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Inspection deleted", type: ResponseMsg })
  @ApiErrorResponses()
  async remove(@Param("id") id: string): Promise<ResponseMsg> {
    return this.inspectionsService.remove(id);
  }
}

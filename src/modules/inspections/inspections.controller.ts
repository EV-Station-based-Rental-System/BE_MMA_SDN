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
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { Inspection } from "src/models/inspections.schema";
import { Report } from "src/models/report.schema";
import { ReportsPhoto } from "src/models/reports_photo.schema";
import { StaffJwtUserPayload } from "src/common/utils/type";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";

@Controller("inspection")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @Roles(Role.STAFF, Role.ADMIN)
  async create(@Body() createInspectionDto: CreateInspectionDto, @Req() req: { user: StaffJwtUserPayload }) {
    return this.inspectionsService.create(createInspectionDto, req.user);
  }

  @Post(":id/upload-photo")
  @Roles(Role.STAFF, Role.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload inspection photo to ImageKit" })
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
  ): Promise<ResponseDetail<ReportsPhoto>> {
    return this.inspectionsService.uploadPhoto(inspectionId, file, label);
  }

  @Get(":id/photos")
  @Roles(Role.STAFF, Role.ADMIN, Role.RENTER)
  async getPhotos(@Param("id") id: string): Promise<ResponseDetail<ReportsPhoto[]>> {
    return this.inspectionsService.getPhotos(id);
  }

  @Post(":id/complete")
  @Roles(Role.STAFF, Role.ADMIN)
  async completeInspection(
    @Param("id") id: string,
    @Body() completeDto: CompleteInspectionDto,
  ): Promise<ResponseDetail<{ inspection: Inspection; report?: Report }>> {
    return this.inspectionsService.completeInspection(id, completeDto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  async remove(@Param("id") id: string): Promise<ResponseMsg> {
    return this.inspectionsService.remove(id);
  }
}

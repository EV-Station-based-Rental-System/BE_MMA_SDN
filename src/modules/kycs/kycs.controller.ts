import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { KycsService } from "./kycs.service";
import { CreateKycsDto } from "./dto/createKycs.dto";
import { UpdateKycsDto } from "./dto/updateKycs.dto";
import { ChangeKycStatusDto } from "./dto/changeStatus.dto";
import { ResponseMsg } from "src/common/response/response-message";
import { Kycs } from "src/models/kycs.schema";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiExtraModels, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RenterJwtUserPayload } from "src/common/utils/type";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";
import type { KycDocumentFile } from "./kycs.service";

@ApiExtraModels(Kycs)
@Controller("kycs")
export class KycsController {
  constructor(private readonly kycsService: KycsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("document_img_url"))
  @ApiCreatedResponse({ description: "KYC created", type: SwaggerResponseDetailDto(Kycs) })
  @ApiErrorResponses()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Type of KYC document",
          example: "driver_license",
        },
        document_number: {
          type: "string",
          description: "Document identification number",
          example: "123456789012",
        },
        expiry_date: {
          type: "string",
          format: "date",
          description: "Document expiry date (ISO 8601)",
          example: "2030-12-31",
        },
        document_img_url: {
          type: "string",
          format: "binary",
          description: "KYC document image (jpg, jpeg, png, gif, webp, pdf) - Max 10MB - Optional",
        },
      },
      required: ["type", "document_img_url"],
    },
  })
  create(
    @Body() createKycsDto: CreateKycsDto,
    @Req() req: { user: RenterJwtUserPayload },
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp|pdf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: KycDocumentFile,
  ) {
    return this.kycsService.create(createKycsDto, req.user, file);
  }

  @Put(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: "KYC updated", type: SwaggerResponseDetailDto(Kycs) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateKycsDto })
  update(@Param("id") id: string, @Body() updateKycsDto: UpdateKycsDto) {
    return this.kycsService.update(id, updateKycsDto);
  }

  @Patch(":id/status")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: "KYC status changed", type: SwaggerResponseDetailDto(Kycs) })
  @ApiErrorResponses()
  @ApiBody({ type: ChangeKycStatusDto })
  changeStatus(@Param("id") id: string, @Body() changeStatusDto: ChangeKycStatusDto) {
    return this.kycsService.changeStatus(id, changeStatusDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: "KYC deleted", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string): Promise<ResponseMsg> {
    return this.kycsService.remove(id);
  }
}

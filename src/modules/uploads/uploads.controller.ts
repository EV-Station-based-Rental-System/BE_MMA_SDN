import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";
import { UploadsService } from "./uploads.service";
import { DevUploadDto } from "./dto/dev-upload.dto";

@ApiTags("Uploads")
@Controller("upload")
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {}

  @Post("dev")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Dev upload bypass: returns a dummy URL (no storage)" })
  @ApiCreatedResponse({ description: "Dummy URL created", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Bypass disabled", type: ResponseBadRequest })
  devUpload(@Body() body: DevUploadDto): ResponseDetail<{ storage_url: string | null; note: string }> {
    const bypass = this.configService.get<boolean>("features.bypassUpload");
    if (!bypass) {
      return ResponseDetail.ok({ storage_url: null, note: "Bypass disabled" }) as ResponseDetail<{ storage_url: string | null; note: string }>;
    }
    const storage_url = body.storage_url ?? this.uploadsService.generateDevUrl(body.filename, body.contentType);
    return ResponseDetail.ok({ storage_url, note: "Bypass enabled" }) as ResponseDetail<{ storage_url: string | null; note: string }>;
  }
}

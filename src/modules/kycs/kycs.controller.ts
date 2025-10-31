import { Controller, Post, Body, Patch, Param, Delete, Put, UseGuards, Req } from "@nestjs/common";
import { KycsService } from "./kycs.service";
import { CreateKycsDto } from "./dto/createKycs.dto";
import { UpdateKycsDto } from "./dto/updateKycs.dto";
import { ChangeKycStatusDto } from "./dto/changeStatus.dto";
import { ResponseMsg } from "src/common/response/response-message";
import { Kycs } from "src/models/kycs.schema";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RenterJwtUserPayload } from "src/common/utils/type";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";

@ApiExtraModels(Kycs)
@Controller("kycs")
export class KycsController {
  constructor(private readonly kycsService: KycsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ description: "KYC created", type: SwaggerResponseDetailDto(Kycs) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateKycsDto })
  create(@Body() createKycsDto: CreateKycsDto, @Req() req: { user: RenterJwtUserPayload }) {
    return this.kycsService.create(createKycsDto, req.user);
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

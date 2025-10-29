import { Controller, Post, Body, Patch, Param, Delete, Put, UseGuards, Req } from "@nestjs/common";
import { KycsService } from "./kycs.service";
import { CreateKycsDto } from "./dto/createKycs.dto";
import { UpdateKycsDto } from "./dto/updateKycs.dto";
import { ChangeKycStatusDto } from "./dto/changeStatus.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { Kycs } from "src/models/kycs.schema";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RenterJwtUserPayload } from "src/common/utils/type";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("kycs")
export class KycsController {
  constructor(private readonly kycsService: KycsService) {}

  @Post()
  create(@Body() createKycsDto: CreateKycsDto, @Req() req: { user: RenterJwtUserPayload }): Promise<ResponseDetail<Kycs>> {
    return this.kycsService.create(createKycsDto, req.user);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateKycsDto: UpdateKycsDto): Promise<ResponseDetail<Kycs>> {
    return this.kycsService.update(id, updateKycsDto);
  }

  @Patch(":id/status")
  changeStatus(@Param("id") id: string, @Body() changeStatusDto: ChangeKycStatusDto): Promise<ResponseDetail<Kycs>> {
    return this.kycsService.changeStatus(id, changeStatusDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<ResponseMsg> {
    return this.kycsService.remove(id);
  }
}

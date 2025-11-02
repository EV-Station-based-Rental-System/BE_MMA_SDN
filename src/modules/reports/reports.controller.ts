import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";
import { ReportPaginationDto } from "./dto/report-pagination.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";
import { Report } from "src/models/report.schema";
import { ResponseMsg } from "src/common/response/response-message";

@ApiExtraModels(Report)
@Controller("report")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ description: "Report created", type: SwaggerResponseDetailDto(Report) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateReportDto })
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  @ApiOkResponse({ description: "List of reports", type: SwaggerResponseListDto(Report) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "inspection_id", required: false, type: String, example: "6714b621a2ce5b57b9e3d5f1" })
  @ApiQuery({ name: "damage_found", required: false, type: Boolean, example: true })
  findAll(@Query() query: ReportPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.reportsService.findAll({ page, take: Math.min(take, 100), ...restFilters });
  }

  @Get(":id")
  @ApiOkResponse({ description: "Report details", type: SwaggerResponseDetailDto(Report) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.reportsService.findOne(id);
  }

  @Put(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: "Report updated", type: SwaggerResponseDetailDto(Report) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateReportDto })
  update(@Param("id") id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: "Report removed", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string) {
    return this.reportsService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { VehicleService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { VehiclePaginationDto } from 'src/common/pagination/dto/vehicle/vehicle-pagination.dto';
import { ResponseDetail } from 'src/common/response/response-detail-create-update';

import { ResponseBadRequest } from 'src/common/response/error/response-bad-request';
import { ResponseUnauthorized } from 'src/common/response/error/response-unauthorized';
import { ResponseForbidden } from 'src/common/response/error/response-forbidden';
import { ResponseConflict } from 'src/common/response/error/response-conflict';
import { ResponseInternalError } from 'src/common/response/error/response-internal-error';
import { ResponseList } from 'src/common/response/response-list';
import { ResponseNotFound } from 'src/common/response/error/response-notfound';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBody({ type: CreateVehicleDto })
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Vehicle created', type: ResponseDetail })
  @ApiBadRequestResponse({ description: 'Invalid payload', type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ResponseForbidden })
  @ApiConflictResponse({ description: 'Vehicle already exists', type: ResponseConflict })
  @ApiInternalServerErrorResponse({ description: 'Server error', type: ResponseInternalError })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles for admin' })
  @ApiOkResponse({ description: 'List of vehicles', type: ResponseList })
  @ApiBadRequestResponse({ description: 'Invalid query', type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: 'Server error', type: ResponseInternalError })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 10 })
  findAll(@Query() query: VehiclePaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.vehicleService.findAll({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Vehicle details', type: ResponseDetail })
  @ApiBadRequestResponse({ description: 'Invalid vehicle id', type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ResponseForbidden })
  @ApiNotFoundResponse({ description: 'Vehicle not found', type: ResponseNotFound })
  @ApiInternalServerErrorResponse({ description: 'Server error', type: ResponseInternalError })
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiOkResponse({ description: 'Vehicle updated', type: ResponseDetail })
  @ApiBadRequestResponse({ description: 'Invalid payload', type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ResponseForbidden })
  @ApiNotFoundResponse({ description: 'Vehicle not found', type: ResponseNotFound })
  @ApiConflictResponse({ description: 'Vehicle already exists', type: ResponseConflict })
  @ApiInternalServerErrorResponse({ description: 'Server error', type: ResponseInternalError })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Vehicle updated', type: ResponseDetail })
  @ApiBadRequestResponse({ description: 'Invalid payload', type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ResponseForbidden })
  @ApiNotFoundResponse({ description: 'Vehicle not found', type: ResponseNotFound })
  @ApiConflictResponse({ description: 'Vehicle already exists', type: ResponseConflict })
  @ApiInternalServerErrorResponse({ description: 'Server error', type: ResponseInternalError })
  @Patch('soft-delete/:id')
  softDelete(@Param('id') id: string) {
    return this.vehicleService.softDelete(id);
  }
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Delete(':id')
  hashDelete(@Param('id') id: string) {
    return this.vehicleService.hashDelete(id);
  }
}

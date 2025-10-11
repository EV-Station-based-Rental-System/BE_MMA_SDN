import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { VehiclePaginationDto } from 'src/common/pagination/dto/vehicle/vehicle-pagination.dto';

@Controller('vehicle')

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) { }

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBody({ type: CreateVehicleDto })
  @ApiBearerAuth()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles for admin' })
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
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiBody({ type: UpdateVehicleDto })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
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

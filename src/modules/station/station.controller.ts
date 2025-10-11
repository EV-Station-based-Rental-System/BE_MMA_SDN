import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { StationPaginationDto } from 'src/common/pagination/dto/station/station-pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) { }

  @Roles(Role.ADMIN)
  @Post()
  @ApiBody({ type: CreateStationDto })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Get()
  @ApiOperation({ summary: 'Get all vehicles for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 10 })
  findAll(@Query() query: StationPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    // Convert string boolean values in filters to actual booleans
    const parsedFilters = Object.fromEntries(
      Object.entries(restFilters).map(([key, value]) => {
        if (value === 'true') return [key, true];
        if (value === 'false') return [key, false];
        return [key, value];
      })
    );
    return this.stationService.findAll(
      { page, take: Math.min(take, 100), ...parsedFilters }
    );
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiBody({ type: UpdateStationDto })
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationService.update(id, updateStationDto);
  }

  @Roles(Role.ADMIN)
  @Patch('soft-delete/:id')
  softDelete(@Param('id') id: string) {
    return this.stationService.softDelete(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  hashDelete(@Param('id') id: string) {
    return this.stationService.hashDelete(id);
  }
}


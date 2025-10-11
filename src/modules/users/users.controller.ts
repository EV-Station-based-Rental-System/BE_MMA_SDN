import { Controller, Get, Body, Patch, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRenterDto } from './dto/renter.dto';
import { UpdateStaffDto } from './dto/staff.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserPaginationDto } from 'src/common/pagination/dto/user/user-pagination.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  @ApiOperation({ summary: 'Get all users for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 10 })
  async findAll(@Query() query: UserPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return await this.usersService.findAll({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }


  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)

  @Put('update-renter/:id')
  updateRenter(@Param('id') id: string, @Body() body: UpdateRenterDto) {
    return this.usersService.updateRenter(id, body);
  }

  @Roles(Role.ADMIN)

  @Put('update-staff/:id')
  updateStaff(@Param('id') id: string, @Body() body: UpdateStaffDto) {
    return this.usersService.updateStaff(id, body);
  }


  @Roles(Role.ADMIN)

  @Patch('soft-delete/:id')
  softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.usersService.restoreStatus(id);
  }


  @Roles(Role.ADMIN)

  @Delete(':id')
  hashDelete(@Param('id') id: string) {
    return this.usersService.hashDelete(id);
  }
}

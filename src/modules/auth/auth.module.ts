import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.schema';
import { Staff, StaffSchema } from 'src/models/staff.schema';
import { Admin, AdminSchema } from 'src/models/admin.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Renter, RenterSchema } from 'src/models/renter.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Renter.name, schema: RenterSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, LocalStrategy],
})
export class AuthModule {}

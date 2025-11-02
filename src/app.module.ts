import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./common/config/config";
import { index } from "./models";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./common/mail/mail.module";
import { RedisModule } from "./common/redis/redis.module";
import { UsersModule } from "./modules/users/users.module";
import { VehicleModule } from "./modules/vehicles/vehicles.module";
import { StationModule } from "./modules/stations/stations.module";
import { ImagekitModule } from "./common/imagekit/imagekit.module";
import { KycsModule } from "./modules/kycs/kycs.module";
import { BookingModule } from "./modules/bookings/booking.module";
import { PaymentModule } from "./modules/payments/payment.module";
import { InspectionsModule } from "./modules/inspections/inspections.module";
import { ContractModule } from "./modules/contracts/contract.module";
import { RentalModule } from "./modules/rentals/rental.module";
import { ReportsModule } from "./modules/reports/reports.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("database.url"),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(index),
    AuthModule,
    UsersModule,
    VehicleModule,
    KycsModule,
    BookingModule,
    PaymentModule,
    InspectionsModule,
    ContractModule,
    RentalModule,

    MailModule,
    RedisModule,
    StationModule,
    ReportsModule,
    ImagekitModule,
  ],
})
export class AppModule {}

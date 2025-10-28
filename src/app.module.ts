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
import { VehicleStationModule } from "./modules/vehicle_station/vehicle_station.module";
import { ImagekitModule } from "./common/imagekit/imagekit.module";
import { PricingModule } from "./modules/pricings/pricing.module";
import { KycsModule } from "./modules/kycs/kycs.module";
import { BookingModule } from "./modules/bookings/booking.module";
import { PaymentModule } from "./modules/payments/payment.module";
import { InspectionsModule } from "./modules/inspections/inspections.module";
import { RentalModule } from "./modules/rentals/rental.module";

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
    VehicleStationModule,
    PricingModule,
    KycsModule,
    BookingModule,
    PaymentModule,
    InspectionsModule,
    RentalModule,

    MailModule,
    RedisModule,
    StationModule,
    ImagekitModule,
  ],
})
export class AppModule { }

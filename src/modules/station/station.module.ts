import { Module } from '@nestjs/common';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Station', schema: {} }])],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule {}

import { Module } from '@nestjs/common';
import { StationService } from './stations.service';
import { StationController } from './stations.controller';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Station', schema: {} }])],
  controllers: [StationController],
  providers: [StationService],
})
export class StationModule { }

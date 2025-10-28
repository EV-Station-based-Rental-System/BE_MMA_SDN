import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { KycsService } from "./kycs.service";
import { KycsController } from "./kycs.controller";
import { Kycs, KycsSchema } from "src/models/kycs.schema";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Kycs.name, schema: KycsSchema }]), UsersModule],
  controllers: [KycsController],
  providers: [KycsService],
  exports: [KycsService],
})
export class KycsModule {}

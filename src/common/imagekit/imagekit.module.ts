import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import ImageKit from "imagekit";
import { ImagekitController } from "./imagekit.controller";
import { ImagekitService } from "./imagekit.service";

@Module({
  imports: [ConfigModule],
  controllers: [ImagekitController],
  providers: [
    {
      provide: "IMAGEKIT",
      useFactory: (configService: ConfigService) => {
        return new ImageKit({
          publicKey: configService.get<string>("image_kit.publicKey") || "",
          privateKey: configService.get<string>("image_kit.privateKey") || "",
          urlEndpoint: configService.get<string>("image_kit.urlEndpoint") || "",
        });
      },
      inject: [ConfigService],
    },
    ImagekitService,
  ],
  exports: [ImagekitService],
})
export class ImagekitModule {}

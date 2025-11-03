import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MomoService } from "./momo.service";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller("payment/momo")
export class MomoController {
  constructor(private readonly momoService: MomoService) {}
  @ApiExcludeEndpoint()
  @Get("return")
  handleMomoReturn(@Query() query: Record<string, string>) {
    return this.momoService.handleReturn(query);
  }

  @ApiExcludeEndpoint()
  @Post("ipn")
  handleMomoIPN(@Body() body: Record<string, string>) {
    // IPN (Instant Payment Notification) from MoMo server
    // This is called by MoMo to notify payment result
    return this.momoService.handleIPN(body);
  }
}

import { Controller, Get, Query } from "@nestjs/common";
import { MomoService } from "./momo.service";
import { ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller("payment/momo")
export class MomoController {
  constructor(private readonly momoService: MomoService) {}
  @ApiExcludeEndpoint()
  @Get("return")
  async handleMomoReturn(@Query() query: Record<string, string>) {
    try {
      // Process MoMo payment callback
      await this.momoService.handleReturn(query);

      // Return JSON response for testing
      return {
        success: true,
        message: "Payment processed successfully",
        data: {
          orderId: query.orderId,
          resultCode: query.resultCode,
          transId: query.transId,
          amount: query.amount,
          message: query.message,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment processing failed";

      // Return error JSON response
      return {
        success: false,
        message: errorMessage,
        data: {
          orderId: query.orderId,
          resultCode: query.resultCode,
        },
      };
    }
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(name: string): string {
    return this.appService.getHello(name);
  }

  @Get('test')
  getTest(): string {
    return this.appService.getTest();
  }
}

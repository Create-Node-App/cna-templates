import { Controller, Get } from '@nestjs/common';
import { AppService, AppStatusResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus(): AppStatusResponse {
    return this.appService.getStatus();
  }
}

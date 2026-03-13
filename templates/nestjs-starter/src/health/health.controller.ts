import { Controller, Get } from '@nestjs/common';
import { AppHealthResponse, AppService } from '../app.service';

@Controller('health')
export class HealthController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): AppHealthResponse {
    return this.appService.getHealth();
  }
}

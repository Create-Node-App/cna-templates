import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppHealthResponseDto } from '../common/dto/app-health-response.dto';
import { AppService } from '../app.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check for load balancers and orchestrators' })
  @ApiOkResponse({ type: AppHealthResponseDto })
  getHealth(): AppHealthResponseDto {
    return this.appService.getHealth();
  }
}

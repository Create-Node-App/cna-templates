import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppStatusResponseDto } from './common/dto/app-status-response.dto';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get starter API status and available routes' })
  @ApiOkResponse({ type: AppStatusResponseDto })
  getStatus(): AppStatusResponseDto {
    return this.appService.getStatus();
  }
}

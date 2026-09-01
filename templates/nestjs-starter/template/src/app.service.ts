import { Injectable } from '@nestjs/common';
import { AppHealthResponseDto } from './common/dto/app-health-response.dto';
import { AppStatusResponseDto } from './common/dto/app-status-response.dto';

@Injectable()
export class AppService {
  getStatus(): AppStatusResponseDto {
    return {
      status: 'ok',
      message: 'NestJS starter API is running.',
      timestamp: new Date().toISOString(),
      routes: {
        root: '/',
        health: '/health',
        docs: '/docs',
      },
      nextSteps: [
        'Add your first feature module.',
        'Wire your environment variables in .env.',
        'Browse the OpenAPI UI at /docs.',
        'Install compatible CNA addons when you need more capabilities.',
      ],
    };
  }

  getHealth(): AppHealthResponseDto {
    return {
      status: 'ok',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }
}

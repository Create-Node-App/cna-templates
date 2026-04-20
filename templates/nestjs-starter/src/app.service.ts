import { Injectable } from '@nestjs/common';

export type AppStatusResponse = {
  status: 'ok';
  message: string;
  timestamp: string;
  routes: {
    root: '/';
    health: '/health';
  };
  nextSteps: string[];
};

export type AppHealthResponse = {
  status: 'ok';
  uptime: number;
  timestamp: string;
};

@Injectable()
export class AppService {
  getStatus(): AppStatusResponse {
    return {
      status: 'ok',
      message: 'NestJS starter API is running.',
      timestamp: new Date().toISOString(),
      routes: {
        root: '/',
        health: '/health',
      },
      nextSteps: [
        'Add your first feature module.',
        'Wire your environment variables in .env.',
        'Install compatible CNA addons when you need more capabilities.',
      ],
    };
  }

  getHealth(): AppHealthResponse {
    return {
      status: 'ok',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }
}

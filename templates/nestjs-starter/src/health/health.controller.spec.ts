import { Test, TestingModule } from '@nestjs/testing';
import { AppHealthResponse, AppService } from '../app.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const healthResponse: AppHealthResponse = {
    status: 'ok',
    uptime: 12.34,
    timestamp: '2026-03-13T00:00:00.000Z',
  };

  const appService = {
    getHealth: jest.fn(() => healthResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    controller = module.get(HealthController);
    appService.getHealth.mockClear();
  });

  it('should delegate health checks to AppService', () => {
    expect(controller.getHealth()).toEqual(healthResponse);
    expect(appService.getHealth).toHaveBeenCalledTimes(1);
  });
});

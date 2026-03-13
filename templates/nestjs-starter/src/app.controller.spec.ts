import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return starter status metadata', () => {
      const appController = app.get(AppController);
      expect(appController.getStatus()).toEqual(
        expect.objectContaining({
          status: 'ok',
          message: 'NestJS starter API is running.',
          routes: {
            root: '/',
            health: '/health',
          },
        }),
      );
    });
  });
});

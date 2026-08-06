import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
          message: 'NestJS starter API is running.',
          routes: {
            root: '/',
            health: '/health',
            docs: '/docs',
          },
        });

        expect(body.timestamp).toEqual(expect.any(String));
        expect(body.nextSteps).toEqual(expect.arrayContaining([expect.any(String)]));
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
        });
        expect(body.uptime).toEqual(expect.any(Number));
        expect(body.timestamp).toEqual(expect.any(String));
      });
  });
});

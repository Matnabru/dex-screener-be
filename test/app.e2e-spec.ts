import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; // Updated import
import { AppModule } from './../src/app.module';

describe('GraphQL E2E Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('getPair query', () => {
    const gqlQuery = `
      query {
        getPair(payload: {
          pairAddress: "0x004375dff511095cc5a197a54140a24efef3a416",
          protocol: UNISWAPV2
        }) {
          name
          price
          protocol
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: gqlQuery })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.getPair).toHaveProperty('name');
        expect(res.body.data.getPair).toHaveProperty('price');
        expect(res.body.data.getPair).toHaveProperty('protocol');
      });
  });


  afterAll(async () => {
    await app.close();
  });
});

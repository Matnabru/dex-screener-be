import { Test, TestingModule } from '@nestjs/testing';
import { PublicQueryResolver } from './public-query.resolver';  

describe('PublicQueryResolver', () => {
  let resolver: PublicQueryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicQueryResolver],
    }).compile();

    resolver = module.get<PublicQueryResolver>(PublicQueryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

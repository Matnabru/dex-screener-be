import { Test, TestingModule } from '@nestjs/testing';
import { PublicMutationResolver } from './public-mutation.resolver';

describe('PublicMutationResolver', () => {
  let resolver: PublicMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicMutationResolver],
    }).compile();

    resolver = module.get<PublicMutationResolver>(PublicMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

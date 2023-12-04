import { Test, TestingModule } from '@nestjs/testing';
import { AuthQueryResolver } from './auth-query.resolver';

describe('AuthQueryResolver', () => {
  let resolver: AuthQueryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthQueryResolver],
    }).compile();

    resolver = module.get<AuthQueryResolver>(AuthQueryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

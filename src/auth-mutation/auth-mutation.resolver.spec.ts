import { Test, TestingModule } from '@nestjs/testing';
import { AuthMutationResolver } from './auth-mutation.resolver';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';


describe('AuthMutationResolver', () => {
  let resolver: AuthMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMutationResolver, FirebaseAdminService], // Include FirebaseAdminService here
    }).compile();

    resolver = module.get<AuthMutationResolver>(AuthMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

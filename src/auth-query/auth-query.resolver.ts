import { Resolver, Query } from '@nestjs/graphql';
import { AuthQuery } from './auth.query';

@Resolver()
export class AuthQueryResolver {
  @Query(() => AuthQuery, { name: 'authQuery' })
  getPublicQuery() {
    return new AuthQuery();
  }
}

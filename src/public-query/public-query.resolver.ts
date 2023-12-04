import { Resolver, Query } from '@nestjs/graphql';
import { PublicQuery } from './public-query';

@Resolver()
export class PublicQueryResolver {
  @Query(() => PublicQuery, { name: 'publicQuery' })
  getPublicQuery() {
    return new PublicQuery();
  }
}

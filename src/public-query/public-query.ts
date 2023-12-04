import { ObjectType, Field } from '@nestjs/graphql';
import { PublicQuery as PublicQueryType } from 'src/generated/graphql';

@ObjectType()
export class PublicQuery {
  @Field(() => String)
  test(): PublicQueryType['test'] {
    return 'Hello from PublicQuery!';
  }
}

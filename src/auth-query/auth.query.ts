import { ObjectType, Field } from '@nestjs/graphql';
import { AuthQuery as AuthQueryType} from 'src/generated/graphql';

@ObjectType()
export class AuthQuery {
  @Field(() => String)
  test(): AuthQueryType['test'] {
    return 'Hello from AuthQuery!';
  }
}

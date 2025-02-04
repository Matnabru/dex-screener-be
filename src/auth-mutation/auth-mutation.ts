import { ObjectType, Field } from '@nestjs/graphql';
import { AuthMutation as AuthMutationType } from '../generated/graphql';

@ObjectType()
export class AuthMutation {
  @Field(() => String)
  test(): AuthMutationType['test'] {
    return 'Hello from AuthQuery!';
  }
}

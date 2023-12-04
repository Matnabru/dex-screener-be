import { ObjectType, Field } from '@nestjs/graphql';
import { PublicMutation as PublicMutationType } from 'src/generated/graphql';

@ObjectType()
export class PublicMutation {
  @Field(() => String)
  test(): PublicMutationType['test'] {
    return 'Hello from AuthQuery!';
  }
}

import { Mutation, Resolver } from '@nestjs/graphql';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { PublicMutation } from './public-mutation';


@Resolver()
export class PublicMutationResolver {
  @Mutation(() => PublicMutation, { name: 'publicMutation' })
  getPublicQuery() {
    return new PublicMutation();
  }
}
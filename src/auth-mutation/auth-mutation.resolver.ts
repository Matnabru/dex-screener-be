import { Mutation, Resolver } from '@nestjs/graphql';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import { AuthMutation } from './auth-mutation';
import { UseGuards } from '@nestjs/common';



@Resolver()
export class AuthMutationResolver {
  @Mutation(() => AuthMutation, { name: 'authMutation' })
  @UseGuards(FirebaseAuthGuard)
  getPublicQuery() {
    return new AuthMutation();
  }
}
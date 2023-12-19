import { ObjectType, Field, Args } from '@nestjs/graphql';
import { AddPairInput, PublicMutation as PublicMutationType } from '../generated/graphql';
import { getPairDetails } from '../web3/uniswap/uniswap';
import * as admin from 'firebase-admin';
@ObjectType()
export class PublicMutation {
  @Field(() => String)
  test(): PublicMutationType['test'] {
    return 'Hello from AuthQuery!';
  }

  @Field(() => String)
  async addPair(
    @Args('payload') nestedPayload: { payload: AddPairInput }
  ): Promise<PublicMutationType['addPair']> {
    const data = await getPairDetails(nestedPayload.payload.pairAddress);
    const db = admin.firestore();
    const pairsCollection = db.collection('pairs').doc(data.address).set(data,  { merge: true });
    return true;
  }
}

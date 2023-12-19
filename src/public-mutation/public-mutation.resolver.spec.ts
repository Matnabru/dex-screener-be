import { Test, TestingModule } from '@nestjs/testing';
import { PublicMutationResolver } from './public-mutation.resolver';

describe('PublicMutationResolver', () => {
  let resolver: PublicMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicMutationResolver],
    }).compile();

    resolver = module.get<PublicMutationResolver>(PublicMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});


import { PublicMutation } from './public-mutation';
import * as admin from 'firebase-admin';
import { getPairDetails } from '../web3/uniswap/uniswap';
import { Protocol } from '../generated/graphql';


jest.mock('../web3/uniswap/uniswap', () => ({
  getPairDetails: jest.fn(),
}));

jest.mock('firebase-admin', () => ({
  firestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(true),
      }),
    }),
  }),
}));

describe('PublicMutation', () => {
  let publicMutation: PublicMutation;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicMutation],
    }).compile();

    publicMutation = module.get<PublicMutation>(PublicMutation);
    jest.clearAllMocks(); 
  });

  it('addPair should add a pair and return true', async () => {
    const mockPairDetails = {
      address: '0x9eb51eb22813ee077e7ef4739a68d8e0b8e67cc6',
      protocol: Protocol.Uniswapv2
    };

    (getPairDetails as jest.Mock).mockResolvedValue(mockPairDetails);

    const nestedPayload = { payload: {
      pairAddress: '0x9eb51eb22813ee077e7ef4739a68d8e0b8e67cc6',
      protocol: Protocol.Uniswapv2 
    } };
    const result = await publicMutation.addPair(nestedPayload);

    expect(result).toBeTruthy();
    expect(getPairDetails).toHaveBeenCalledWith(nestedPayload.payload.pairAddress);
    expect(admin.firestore().collection).toHaveBeenCalledWith('pairs');
  });
});


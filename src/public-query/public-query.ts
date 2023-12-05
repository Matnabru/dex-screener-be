import { ObjectType, Field, Args } from '@nestjs/graphql';
import { GetOhlcInput, GetPairInput, GetSwapsInput, PublicQuery as PublicQueryType, Timeframe } from 'src/generated/graphql';
import { generateCandles, getBlockNumberAfterTimestamp, swapEventsWithPrice } from 'src/web3/uniswap/uniswap';

@ObjectType()
export class PublicQuery {
  @Field(() => String)
  async test(): Promise<PublicQueryType['test']> {
    const data = await swapEventsWithPrice(
      "0x80f5666a6fe5c51739dc99b55463d5b098ffc10a",
      "2023-12-06T06:00:00.000Z",
      undefined);
    const candles = generateCandles(data, Timeframe.M1);
    return 'Hello from PublicQuery!';
  }

  @Field(() => String)
  async getSwaps(
    @Args('payload') nestedPayload: { payload: GetSwapsInput }
  ): Promise<PublicQueryType['getSwaps']> {
    const block = await getBlockNumberAfterTimestamp(nestedPayload.payload.dateFrom)
    const data = await swapEventsWithPrice(nestedPayload.payload.pairAddress, nestedPayload.payload.dateFrom, nestedPayload.payload.dateTo);
    const candles = generateCandles(data, Timeframe.M1);
    return data;
  }

  @Field(() => String)
  async getPair(
    @Args('payload') nestedPayload: { payload: GetPairInput }
  ): Promise<PublicQueryType['getPair']> {
    throw new Error("Not implemented")
  }

  @Field(() => String)
  async getOhlc(
    @Args('payload') nestedPayload: { payload: GetOhlcInput }
  ): Promise<PublicQueryType['getOhlc']> {
    const data = await swapEventsWithPrice(nestedPayload.payload.pairAddress, nestedPayload.payload.dateFrom, nestedPayload.payload.dateTo);
    const candles = generateCandles(data, Timeframe.H1);
    return candles;
  }


}

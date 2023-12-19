import { ObjectType, Field, Args } from '@nestjs/graphql';
import { GetOhlcInput, GetPairInput, GetSwapsInput, Protocol, PublicQuery as PublicQueryType, Timeframe } from '../generated/graphql';
import { generateCandles, getBlockNumberAfterTimestamp, swapEventsWithPrice, swapEventsWithPriceUsingBlock } from '../web3/uniswap/uniswap';
import * as admin from 'firebase-admin';
import {  groupCandlesByDay, groupCandlesByMonth, groupCandlesByYear, storeAndUpdateCandles } from '../utils/candles';
import { getOhlcData, refetchData } from '../utils/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

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
    const data = await swapEventsWithPrice(nestedPayload.payload.pairAddress, nestedPayload.payload.dateFrom, nestedPayload.payload.dateTo);
    //const candles = generateCandles(data, Timeframe.M1);
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
    const db = admin.firestore();
    const data = await getOhlcData(nestedPayload.payload,db)
    console.log(data)
    refetchData(nestedPayload.payload, db).catch(error => {
      console.error('Error in someAsyncFunction:', error);
    });
    return data.candles;
  }

  @Field(() => String)
  async getOhlcDirectly(
    @Args('payload') nestedPayload: { payload: GetOhlcInput }
  ): Promise<PublicQueryType['getOhlcDirectly']> {
    console.log(nestedPayload.payload.dateFrom)
    console.log(nestedPayload.payload.dateTo)
    const data = await swapEventsWithPrice(nestedPayload.payload.pairAddress, nestedPayload.payload.dateFrom, nestedPayload.payload.dateTo);
    console.log(data)
    const candles = generateCandles(data, nestedPayload.payload.timeframe);
    console.log(candles)
    return candles;
  }

  @Field(() => String)
  async loadOhlc(
    @Args('payload') nestedPayload: { payload: GetOhlcInput }
  ): Promise<PublicQueryType['loadOhlc']> {
    switch (nestedPayload.payload.protocol) {
      case Protocol.Uniswapv2:
        {
          console.log(nestedPayload.payload.dateFrom)
          console.log(nestedPayload.payload.dateTo)
          const db = admin.firestore();

          const pairBlocks = await db.doc(`protocols/${Protocol.Uniswapv2}/pairs/${nestedPayload.payload.pairAddress}`)
            .get();
          const pairBlocksData = pairBlocks.data();
          console.log(pairBlocksData)
          let startBlock;
          if (pairBlocksData.prevBlock && pairBlocksData.lastBlock) {
            startBlock = pairBlocksData.lastBlock
          } else {
            startBlock = await getBlockNumberAfterTimestamp(nestedPayload.payload.dateFrom);
          }
          const data = await swapEventsWithPriceUsingBlock(nestedPayload.payload.pairAddress, startBlock, nestedPayload.payload.dateTo);

          const pairsCollection = await db.collection('protocols').doc(Protocol.Uniswapv2).collection('pairs').doc(nestedPayload.payload.pairAddress).collection('swaps').doc(startBlock.toString()).set({ data: data.transactions, startBlock: startBlock.toString(), endBlock: data.endBlock, createdAt: new Date().toISOString() }, { merge: true });

          const insertLastBlock = await db.doc(`protocols/${Protocol.Uniswapv2}/pairs/${nestedPayload.payload.pairAddress}`)
            .set({ lastBlock: data.endBlock, prevBlock: startBlock }, { merge: true });

            const fiveMinCandles = generateCandles(data.transactions, Timeframe.M5);
            const hourlyCandles = generateCandles(data.transactions, Timeframe.H1);
            const dailyCandles = generateCandles(data.transactions, Timeframe.D1);
    
            // Store and update 5-minute candles
            const groupedFiveMinCandles = groupCandlesByDay(fiveMinCandles);
            for (const [day, dayCandles] of Object.entries(groupedFiveMinCandles)) {
              const candleDocPath = `protocols/${Protocol.Uniswapv2}/pairs/${nestedPayload.payload.pairAddress}/candles/timeframe/${Timeframe.M5}/${day}`;
              await storeAndUpdateCandles(db, candleDocPath, dayCandles);
            }
    
            // Store and update hourly candles
            const groupedHourlyCandles = groupCandlesByMonth(hourlyCandles);
            for (const [month, monthCandles] of Object.entries(groupedHourlyCandles)) {
              const candleDocPath = `protocols/${Protocol.Uniswapv2}/pairs/${nestedPayload.payload.pairAddress}/candles/timeframe/${Timeframe.H1}/${month}`;
              await storeAndUpdateCandles(db, candleDocPath, monthCandles);
            }
    
            // Store and update daily candles
            const groupedDailyCandles = groupCandlesByYear(dailyCandles);
            for (const [year, yearCandles] of Object.entries(groupedDailyCandles)) {
              const candleDocPath = `protocols/${Protocol.Uniswapv2}/pairs/${nestedPayload.payload.pairAddress}/candles/timeframe/${Timeframe.D1}/${year}`;
              await storeAndUpdateCandles(db, candleDocPath, yearCandles);
            }
    
            return fiveMinCandles; // or return an appropriate response

        }
    }
    throw new Error("Unsupported protocol");
  }


}

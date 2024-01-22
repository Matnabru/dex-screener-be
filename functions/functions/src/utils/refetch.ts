import { Protocol, Timeframe } from "../../../generated/graphql";
import {
  groupCandlesByDay,
  groupCandlesByMonth,
  groupCandlesByYear,
  storeAndUpdateCandles,
} from "./candles";
import {
  generateCandles,
  getBlockNumberAfterTimestamp,
  swapEventsWithPriceUsingBlock,
} from "./uniswap";

export type dataUpdate = {
  pairAddress: string;
  protocol: Protocol;
  timeFrame: Timeframe;
  dateFrom: string;
};

export async function refetchData(input: dataUpdate, db: any): Promise<any> {
  const payload = input;
  switch (payload.protocol) {
  case Protocol.Uniswapv2: {
    const pairBlocks = await db
      .doc(`protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}`)
      .get();
    const pairBlocksData = pairBlocks.data();
    console.log(pairBlocksData);
    let startBlock;
    if (pairBlocksData.prevBlock && pairBlocksData.lastBlock) {
      startBlock = pairBlocksData.lastBlock;
    } else {
      startBlock = await getBlockNumberAfterTimestamp(payload.dateFrom);
    }
    const data = await swapEventsWithPriceUsingBlock(
      payload.pairAddress,
      startBlock,
    );

    await db
      .collection("protocols")
      .doc(Protocol.Uniswapv2)
      .collection("pairs")
      .doc(payload.pairAddress)
      .collection("swaps")
      .doc(startBlock.toString())
      .set(
        {
          data: data.transactions,
          startBlock: startBlock.toString(),
          endBlock: data.endBlock,
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );

    await db
      .doc(`protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}`)
      .set(
        { lastBlock: data.endBlock, prevBlock: startBlock },
        { merge: true },
      );

    const fiveMinCandles = generateCandles(data.transactions, Timeframe.M5);
    const hourlyCandles = generateCandles(data.transactions, Timeframe.H1);
    const dailyCandles = generateCandles(data.transactions, Timeframe.D1);

    // Store and update 5-minute candles
    const groupedFiveMinCandles = groupCandlesByDay(fiveMinCandles);
    for (const [day, dayCandles] of Object.entries(groupedFiveMinCandles)) {
      const candleDocPath = `protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}/candles/timeframe/${Timeframe.M5}/${day}`;
      await storeAndUpdateCandles(db, candleDocPath, dayCandles);
    }

    // Store and update hourly candles
    const groupedHourlyCandles = groupCandlesByMonth(hourlyCandles);
    for (const [month, monthCandles] of Object.entries(
      groupedHourlyCandles,
    )) {
      const candleDocPath = `protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}/candles/timeframe/${Timeframe.H1}/${month}`;
      await storeAndUpdateCandles(db, candleDocPath, monthCandles);
    }

    // Store and update daily candles
    const groupedDailyCandles = groupCandlesByYear(dailyCandles);
    for (const [year, yearCandles] of Object.entries(groupedDailyCandles)) {
      const candleDocPath = `protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}/candles/timeframe/${Timeframe.D1}/${year}`;
      await storeAndUpdateCandles(db, candleDocPath, yearCandles);
    }

    return fiveMinCandles; // or return an appropriate response
  }
  }
  throw new Error("Unsupported protocol");
}

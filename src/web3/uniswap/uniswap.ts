import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { abi as uniswapPairABI } from './IUniswapV2Pair.json';
import { Candle, Timeframe, Transaction } from 'src/generated/graphql';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/fe053da3410d481f8537499a08bdfe7b'));

export async function swapEventsWithPrice(contractAddress: string, startDate: string, endDate: string | undefined): Promise<Transaction[]> {
  const contract = new web3.eth.Contract(uniswapPairABI, contractAddress);
  try {
    const endBlock = await (endDate ? getBlockNumberAfterTimestamp(endDate) : await web3.eth.getBlockNumber());
    const startBlock = await getBlockNumberAfterTimestamp(startDate);

    const events = await (contract.getPastEvents as any)('Swap', {
      fromBlock: startBlock,
      toBlock: endBlock
    });

    const pricedEvents = events.map(async event => {
      const { amount0In, amount0Out, amount1In, amount1Out } = event.returnValues;

      const token0Decimals = 18;
      const token1Decimals = 18;

      let price;
      let type, unit, weth;
      if (amount0In > 0n && amount1Out > 0n) { // amount1 (WETH) out, amount0 (Token) in
        const amount0InBig = new BigNumber(amount0In.toString());
        const amount1OutBig = new BigNumber(amount1Out.toString());
        price = amount1OutBig.dividedBy(10 ** token0Decimals)
          .dividedBy(amount0InBig.dividedBy(10 ** token1Decimals));
        type = "SELL";
        unit = amount0InBig;
        weth = amount1OutBig;
      } else if (amount1In > 0n && amount0Out > 0n) { // amount1 (WETH) in, amount0 (Token) out
        const amount1InBig = new BigNumber(amount1In.toString());
        const amount0OutBig = new BigNumber(amount0Out.toString());
        price = amount1InBig.dividedBy(10 ** token1Decimals)
          .dividedBy(amount0OutBig.dividedBy(10 ** token0Decimals));
        type = "BUY";
        unit = amount0OutBig;
        weth = amount1InBig;
      }

      const block = await web3.eth.getBlock(event.blockNumber);
      const timestamp = block.timestamp;
      const timestampInMilliseconds = Number(timestamp) * 1000;

      const date = new Date(timestampInMilliseconds);

      const data: Transaction = {
        type,
        unit: unit ? unit.toString() : null,
        weth: weth ? weth.toString() : null,
        price: price ? price.toFixed(18) : null,
        timestamp: date.toISOString()
      }
      return data;
    });

    return await Promise.all(pricedEvents.filter(e => e));  // Filter out undefined entries
  } catch (error) {
    console.error(error);
    return [];
  }
}


export function generateCandles(events: Transaction[], timeframe: Timeframe): Candle[] {
  const timeframeInSeconds = {
    D1: 86400,
    H4: 14400,
    H1: 3600,
    M15: 900,
    M5: 300,
    M1: 60,
  };

  const groupedEvents = groupEventsByTimeframe(events, timeframeInSeconds[timeframe]);
  return groupedEvents.map(group => createCandle(group, timeframe));
}

function groupEventsByTimeframe(events: Transaction[], seconds: number): Transaction[][] {
  const groups: Transaction[][] = [];
  let currentGroup: Transaction[] = [];

  events.forEach(event => {
    const eventTimestamp = new Date(event.timestamp).getTime() / 1000;
    if (currentGroup.length === 0 || eventTimestamp - new Date(currentGroup[0].timestamp).getTime() / 1000 < seconds) {
      currentGroup.push(event);
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function createCandle(events: Transaction[], timeframe: Timeframe): Candle {
  const sortedPrices = events.map(e => parseFloat(e.price)).sort((a, b) => a - b);
  return {
    open: sortedPrices[0],
    high: sortedPrices[sortedPrices.length - 1],
    low: sortedPrices[0],
    close: sortedPrices[sortedPrices.length - 1],
    openTime: events[0].timestamp,
    timeframe: timeframe,
  };
}

export async function getBlockNumberAfterTimestamp(targetTimestamp: string) {
  const targetTimeMilliseconds = new Date(targetTimestamp).getTime();
  const targetTimeSeconds = targetTimeMilliseconds / 1000;
  const targetTime = new BigNumber(targetTimeSeconds.toString());
  const currentBlockNumber = new BigNumber((await web3.eth.getBlockNumber()).toString());
  const currentBlock = await web3.eth.getBlock(currentBlockNumber.toNumber());
  const currentBlockTime = new BigNumber(currentBlock.timestamp.toString());

  // Every new block is created in approx. 12.07 seconds
  const averageBlockTime = new BigNumber(12.07);

  let estimatedBlockNumber = currentBlockNumber.plus(
    targetTime.minus(currentBlockTime)
      .dividedBy(averageBlockTime)
      .decimalPlaces(0, BigNumber.ROUND_CEIL)
  );
  while (true) {
    const block = await web3.eth.getBlock(estimatedBlockNumber.toNumber());
    if (new BigNumber(block.timestamp.toString()).isGreaterThan(targetTime)) {
      const previousBlock = await web3.eth.getBlock(estimatedBlockNumber.minus(1).toNumber());
      if (new BigNumber(previousBlock.timestamp.toString()).isLessThanOrEqualTo(targetTime)) {
        return estimatedBlockNumber.toNumber();
      }
      estimatedBlockNumber = estimatedBlockNumber.minus(1);
    } else {
      estimatedBlockNumber = estimatedBlockNumber.plus(1);
    }
  }
}
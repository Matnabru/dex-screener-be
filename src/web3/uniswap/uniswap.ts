import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { abi as uniswapPairABI } from './IUniswapV2Pair.json';
import { Candle, Pair, Protocol, Timeframe, Transaction } from 'src/generated/graphql';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/fe053da3410d481f8537499a08bdfe7b'));

function convertToFloat(bigNumber, decimals) {
  return new BigNumber(bigNumber.toString()).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
}


export async function swapEventsWithPrice(contractAddress: string, startDate: string, endDate: string | undefined): Promise<Transaction[]> {
  const contract = new web3.eth.Contract(uniswapPairABI, contractAddress);
  try {
    let latestBlock = await web3.eth.getBlockNumber();
    try {
      //const latestBlock = await getBlockNumberAfterTimestamp(endDate);
    }
    catch {

    }
    console.log(latestBlock)
    const endBlock = latestBlock;
    console.log(endBlock)
    const startBlock = await getBlockNumberAfterTimestamp(startDate);

    const events = await (contract.getPastEvents as any)('Swap', {
      fromBlock: startBlock,
      toBlock: endBlock
    });

    const pricedEvents = events.map(async event => {
      const { amount0In, amount0Out, amount1In, amount1Out, sender, to } = event.returnValues;
      const token0Decimals = 18;
      const token1Decimals = 18;

      const amount0InFloat = convertToFloat(amount0In, token0Decimals);
      const amount0OutFloat = convertToFloat(amount0Out, token0Decimals);
      const amount1InFloat = convertToFloat(amount1In, token1Decimals);
      const amount1OutFloat = convertToFloat(amount1Out, token1Decimals);

      let price;
      let type, unit, weth;
      if (amount0In > 0n && amount1Out > 0n) {
        // Use the float values for calculations and output
        price = amount1OutFloat / amount0InFloat;
        type = "SELL";
        unit = amount0InFloat;
        weth = amount1OutFloat;
      } else if (amount1In > 0n && amount0Out > 0n) {
        price = amount1InFloat / amount0OutFloat;
        type = "BUY";
        unit = amount0OutFloat;
        weth = amount1InFloat;
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
        timestamp: date.toISOString(),
        sender,
        to
      }
      return data;
    });

    return await Promise.all(pricedEvents.filter(e => e));  // Filter out undefined entries
  } catch (error) {
    console.error(error);
    return [];
  }
}

interface TransactionWithEndBlock {
  transactions: Transaction[];
  endBlock: number;
}

export async function swapEventsWithPriceUsingBlock(contractAddress: string, lastBlock: number, endDate: string | undefined): Promise<TransactionWithEndBlock> {
  const contract = new web3.eth.Contract(uniswapPairABI, contractAddress);
  let endBlock;
  try {
    endBlock = await web3.eth.getBlockNumber();
    const startBlock = lastBlock

    const events = await (contract.getPastEvents as any)('Swap', {
      fromBlock: startBlock,
      toBlock: endBlock
    });

    const pricedEvents = events.map(async event => {
      const { amount0In, amount0Out, amount1In, amount1Out, sender, to } = event.returnValues;
      const token0Decimals = 18;
      const token1Decimals = 18;

      const amount0InFloat = convertToFloat(amount0In, token0Decimals);
      const amount0OutFloat = convertToFloat(amount0Out, token0Decimals);
      const amount1InFloat = convertToFloat(amount1In, token1Decimals);
      const amount1OutFloat = convertToFloat(amount1Out, token1Decimals);

      let price;
      let type, unit, weth;
      if (amount0In > 0n && amount1Out > 0n) {
        // Use the float values for calculations and output
        price = amount1OutFloat / amount0InFloat;
        type = "SELL";
        unit = amount0InFloat;
        weth = amount1OutFloat;
      } else if (amount1In > 0n && amount0Out > 0n) {
        price = amount1InFloat / amount0OutFloat;
        type = "BUY";
        unit = amount0OutFloat;
        weth = amount1InFloat;
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
        timestamp: date.toISOString(),
        sender,
        to
      }
      return data;
    });

    const transactions = await Promise.all(pricedEvents.filter(e => e)); 
    
    const result: TransactionWithEndBlock = {
      transactions,
      endBlock,
    };
    return result;
  } catch (error) {
    console.error(error);
    return {
      transactions: [],
      endBlock: 0,
    };
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

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return groupEventsByTimeframe(events, timeframeInSeconds[timeframe], timeframe);
}

function groupEventsByTimeframe(events: Transaction[], seconds: number, timeframe: Timeframe): Candle[] {
  if (events.length === 0) {
    return [];
  }

  const sortedEvents = events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  let startTime = getStartTimeOfTimeframe(new Date(sortedEvents[0].timestamp), seconds);
  let currentCandle = createInitialCandle(startTime, parseFloat(sortedEvents[0].price), timeframe);

  const candles = [currentCandle];

  sortedEvents.forEach(event => {
    const eventTimestamp = new Date(event.timestamp).getTime();
    const eventPrice = parseFloat(event.price);

    if (eventTimestamp < startTime + seconds * 1000) {
      // Update the current candle with this event
      currentCandle.high = Math.max(currentCandle.high, eventPrice);
      currentCandle.low = Math.min(currentCandle.low, eventPrice);
      currentCandle.close = eventPrice;
    } else {
      // Time to start a new candle
      while (eventTimestamp >= startTime + seconds * 1000) {
        startTime += seconds * 1000;
        // Create a new candle with the close of the previous one
        currentCandle = createInitialCandle(startTime, currentCandle.close, timeframe);
        candles.push(currentCandle);
      }
      // Update the new candle with this event
      currentCandle.high = Math.max(currentCandle.high, eventPrice);
      currentCandle.low = Math.min(currentCandle.low, eventPrice);
      currentCandle.close = eventPrice;
    }
  });
  candles.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return candles;
}

function createInitialCandle(startTime, initialPrice, timeframe) {
  return {
    open: initialPrice,
    high: initialPrice,
    low: initialPrice,
    close: initialPrice,
    time: new Date(startTime).toISOString(),
    timeFrame: timeframe
  };
}

function getStartTimeOfTimeframe(date, seconds) {
  const dateCopy = new Date(date.getTime());
  dateCopy.setUTCSeconds(0, 0); // Reset seconds and milliseconds
  const delta = dateCopy.getTime() % (seconds * 1000);
  return dateCopy.getTime() - delta; // Adjust to the start of the timeframe
}

export async function getBlockNumberAfterTimestamp(targetTimestamp: string): Promise<number> {
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

export async function getPairDetails(pairAddress: string): Promise<any> {
  const pairContract = new web3.eth.Contract(uniswapPairABI, pairAddress);

  try {
    const name = await pairContract.methods.name().call();
    const token0Address: any = await pairContract.methods.token0().call();
    const token1Address: any = await pairContract.methods.token1().call();
    const [token0Decimals, token1Decimals] = await Promise.all([
      getTokenDecimals(token0Address),
      getTokenDecimals(token1Address),
    ]);
    const reserves = await pairContract.methods.getReserves().call();
    const protocol = 'UNISWAPV2';

    const [token0Symbol, token1Symbol] = await Promise.all([
      getTokenSymbol(token0Address),
      getTokenSymbol(token1Address),
    ]);
    if (typeof token0Decimals !== 'bigint' || typeof token1Decimals !== 'bigint') {
      throw new Error("Token decimals is not a bigint");
    }
    const reserve1adjusted = (Number(reserves[0] * 1000000000000000n / convertToBiggerBigInt(1n, token0Decimals)) / 1000000000000000);
    const reserve2adjusted = (Number(reserves[1] * 1000000000000000n / convertToBiggerBigInt(1n, token1Decimals)) / 1000000000000000);
    const price = (reserve2adjusted / reserve1adjusted).toString();
    return {
      name: token0Symbol,
      longName: token0Symbol,
      price,
      reserve0: reserve1adjusted.toString(),
      reserve1: reserve2adjusted.toString(),
      token1Decimals: token1Decimals.toString(),
      token0Decimals: token0Decimals.toString(),
      symbol0: token0Symbol,
      symbol1: token1Symbol,
      protocol,
      address: pairAddress
    };
  } catch (error) {
    console.error('Error fetching pair details:', error);
    throw error;
  }
}

import erc20ABI from '../uniswap/erc20.abi.json';

async function getTokenDecimals(tokenAddress: string): Promise<BigInt> {
  const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
  return await tokenContract.methods.decimals().call();
}

async function getTokenSymbol(tokenAddress: string) {
  const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
  return await tokenContract.methods.symbol().call();
}

function convertToBiggerBigInt(n, powerOf10) {
  if (powerOf10 < 0) {
    throw new Error('Power of 10 must be non-negative.');
  }

  if (powerOf10 === 0) {
    return n;
  }

  const multiplier = BigInt(10) ** BigInt(powerOf10);
  return n * multiplier;
}
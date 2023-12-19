import { Candle } from "../generated/graphql";

export function combineCandleData(existingCandles: Candle[], newCandles: Candle[]): Candle[] {
  // Check if there is an overlap in the candle data
  if (existingCandles.length > 0 && newCandles.length > 0 && existingCandles[existingCandles.length - 1].time === newCandles[0].time) {
    // Merge the last existing candle with the first new candle
    const lastExistingCandle = existingCandles[existingCandles.length - 1];
    const firstNewCandle = newCandles[0];

    lastExistingCandle.close = firstNewCandle.close;
    lastExistingCandle.high = Math.max(lastExistingCandle.high, firstNewCandle.high);
    lastExistingCandle.low = Math.min(lastExistingCandle.low, firstNewCandle.low);
    // The 'open' value of the last existing candle remains unchanged

    // Remove the first new candle as it's now merged with the last existing one
    newCandles.shift();
  }

  // Append the rest of the new candles to the existing array
  return [...existingCandles, ...newCandles];
}


export function groupCandlesByDay(candles: Candle[]): Record<string, Candle[]> {
  const groupedCandles: Record<string, Candle[]> = {};
  candles.forEach(candle => {
    const day = candle.time.split('T')[0]; // Extract the date part (YYYY-MM-DD) from the timestamp
    if (!groupedCandles[day]) {
      groupedCandles[day] = [];
    }
    groupedCandles[day].push(candle);
  });
  return groupedCandles;
}


export function groupCandlesByMonth(candles: Candle[]): Record<string, Candle[]> {
  // Group H1 candles by month
  const groupedCandles: Record<string, Candle[]> = {};
  candles.forEach(candle => {
    const month = candle.time.split('T')[0].slice(0, 7); // Extract YYYY-MM
    if (!groupedCandles[month]) {
      groupedCandles[month] = [];
    }
    groupedCandles[month].push(candle);
  });
  return groupedCandles;
}

export function groupCandlesByYear(candles: Candle[]): Record<string, Candle[]> {
  // Group D1 candles by year
  const groupedCandles: Record<string, Candle[]> = {};
  candles.forEach(candle => {
    const year = candle.time.split('T')[0].slice(0, 4); // Extract YYYY
    if (!groupedCandles[year]) {
      groupedCandles[year] = [];
    }
    groupedCandles[year].push(candle);
  });
  return groupedCandles;
}


export async function storeAndUpdateCandles(db, path, candles) {
  const candleDoc = await db.doc(path).get();
  let existingCandles = candleDoc.exists ? candleDoc.data().candles : [];
  const combinedCandles = combineCandleData(existingCandles, candles);
  await db.doc(path).set({ candles: combinedCandles }, { merge: true });
}
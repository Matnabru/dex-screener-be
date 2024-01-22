import { GetOhlcInput, Protocol, Timeframe } from "src/generated/graphql";
import { generateCandles, getBlockNumberAfterTimestamp, swapEventsWithPriceUsingBlock } from "src/web3/uniswap/uniswap";
import { groupCandlesByDay, groupCandlesByMonth, groupCandlesByYear, storeAndUpdateCandles } from "./candles";

export async function getOhlcData(input: GetOhlcInput, db: FirebaseFirestore.Firestore): Promise<any> {
    let docPath = `protocols/${input.protocol}/pairs/${input.pairAddress}/candles/timeframe/${input.timeframe}/`;
  
    // Adjust the doc path based on the timeframe
    switch (input.timeframe) {
      case 'M5': // For 5-minute candles, include year, month, and day
        docPath += formatDateToYearMonthDay(input.dateFrom);
        break;
      case 'H1': // For hourly candles, include year and month
        docPath += formatDateToYearMonth(input.dateFrom);
        break;
      case 'D1': // For daily candles, include only year
        docPath += formatDateToYear(input.dateFrom);
        break;
      default:
        throw new Error("Unsupported timeframe");
    }
  
    // Fetch the document from Firestore
    const doc = await db.doc(docPath).get();
    return doc.exists ? doc.data() : null;
  }
  
  // Utility functions to format dates
  function formatDateToYearMonthDay(isoDateString: string): string {
    const date = new Date(isoDateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
  
  function formatDateToYearMonth(isoDateString: string): string {
    const date = new Date(isoDateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  
  function formatDateToYear(isoDateString: string): string {
    const date = new Date(isoDateString);
    return `${date.getFullYear()}`;
  }


  export async function refetchData(input: GetOhlcInput, db: FirebaseFirestore.Firestore): Promise<any> {
    const payload = input;
    switch (payload.protocol) {
        case Protocol.Uniswapv2:
          {
            console.log(payload.dateFrom)
            console.log(payload.dateTo)
  
            const pairBlocks = await db.doc(`protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}`)
              .get();
            const pairBlocksData = pairBlocks.data();
            console.log(pairBlocksData)
            let startBlock;
            if (pairBlocksData.prevBlock && pairBlocksData.lastBlock) {
              startBlock = pairBlocksData.lastBlock
            } else {
              startBlock = await getBlockNumberAfterTimestamp(payload.dateFrom);
            }
            const data = await swapEventsWithPriceUsingBlock(payload.pairAddress, startBlock, payload.dateTo);
  
            const pairsCollection = await db.collection('protocols').doc(Protocol.Uniswapv2).collection('pairs').doc(payload.pairAddress).collection('swaps').doc(startBlock.toString()).set({ data: data.transactions, startBlock: startBlock.toString(), endBlock: data.endBlock, createdAt: new Date().toISOString() }, { merge: true });
  
            const insertLastBlock = await db.doc(`protocols/${Protocol.Uniswapv2}/pairs/${payload.pairAddress}`)
              .set({ lastBlock: data.endBlock, prevBlock: startBlock }, { merge: true });
  
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
              for (const [month, monthCandles] of Object.entries(groupedHourlyCandles)) {
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
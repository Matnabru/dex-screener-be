import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { abi as uniswapPairABI } from './IUniswapV2Pair.json';

export async function swapEventsWithPrice(contractAddress) {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/fe053da3410d481f8537499a08bdfe7b'));
    const contract = new web3.eth.Contract(uniswapPairABI, contractAddress);

    try {
        const currentBlock = await web3.eth.getBlockNumber();
        const blocksInFiveMinutes = Math.floor(800 / 14);
        const startBlock = currentBlock - BigInt(blocksInFiveMinutes);

        const events = await (contract.getPastEvents as any)('Swap', {
            fromBlock: startBlock,
            toBlock: currentBlock
        });

        const pricedEventsPromises = events.map(async event => {
            const { amount0In, amount0Out, amount1In, amount1Out } = event.returnValues;

            const token0Decimals = 18; // Adjust according to the actual token decimals
            const token1Decimals = 18; // Adjust according to the actual token decimals

            let price;
            let type, unit, weth;
            if (BigInt(amount0In) > 0n && BigInt(amount1Out) > 0n) {
                // ... rest of the logic remains the same ...
            } else if (BigInt(amount1In) > 0n && BigInt(amount0Out) > 0n) {
                // ... rest of the logic remains the same ...
            }

            // Fetch block for the timestamp
            const block = await web3.eth.getBlock(event.blockNumber);
            const timestamp = block.timestamp;

            return {
                type, 
                unit: unit ? unit.toString() : null, 
                weth: weth ? weth.toString() : null, 
                price: price ? price.toFixed(18) : null,
                timestamp
            };
        });

        return await Promise.all(pricedEventsPromises.filter(e => e)); // Await all promises and filter out undefined entries
    } catch (error) {
        console.error(error);
        return [];
    }
}

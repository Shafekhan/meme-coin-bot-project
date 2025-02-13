import { Connection, PublicKey } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import axios from 'axios'
import { API_URLS } from '@raydium-io/raydium-sdk-v2'

const connection = new Connection(process.env.RPC_URL!);
const slippage = 5;

export async function swap(tokenAddress: string, amount: number) {
    try {
        
        const { data } = await axios.get<{
            id: string
            success: boolean
            data: { default: { vh: number; h: number; m: number } }
        }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);
        const { data: swapResponse } = await axios.get(
            `${API_URLS.SWAP_HOST}/compute/swap-base-in?inputMint=${NATIVE_MINT}&outputMint=${tokenAddress}&amount=${amount}&slippageBps=${slippage * 100}&txVersion=V0`
        );

        console.log('Potential Swap Details:');
        console.log({
            tokenAddress,
            amount,
            priorityFee: data.data.default.h,
            swapResponse
        });

        return {
            status: 'simulated',
            tokenAddress: tokenAddress,
            inputAmount: amount,
            swapDetails: swapResponse,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error in swap simulation:', error);
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            tokenAddress,
            timestamp: new Date().toISOString()
        };
    }
}
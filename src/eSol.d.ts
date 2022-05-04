import { ESolConfig } from './config';
import { PublicKey, Transaction } from '@solana/web3.js';
export declare class ESol {
    readonly config: ESolConfig;
    constructor(config?: ESolConfig);
    depositSol(userAddress: PublicKey, lamports: number, poolTokenReceiverAccount?: PublicKey, daoCommunityTokenReceiverAccount?: PublicKey, referrerTokenAccount?: PublicKey): Promise<Transaction>;
}

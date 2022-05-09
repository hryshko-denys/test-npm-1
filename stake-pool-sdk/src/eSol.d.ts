import { ESolConfig, ClusterType } from './config';
import { PublicKey, Transaction } from '@solana/web3.js';
export declare class ESol {
    readonly config: ESolConfig;
    constructor(clusterType?: ClusterType);
    depositSol(userAddress: PublicKey, lamports: number, poolTokenReceiverAccount?: PublicKey, daoCommunityTokenReceiverAccount?: PublicKey, referrerTokenAccount?: PublicKey): Promise<Transaction>;
    unDelegateSol(userAddress: PublicKey, lamports: number, solWithdrawAuthority?: PublicKey): Promise<Transaction>;
    withdrawSol(userAddress: PublicKey, lamports: number, stakeReceiver?: PublicKey, poolTokenAccount?: PublicKey): Promise<Transaction>;
}

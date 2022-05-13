import { PublicKey, Connection, AccountInfo, TransactionInstruction } from '@solana/web3.js';
import { StakePool } from "./layouts";
export interface StakePoolAccount {
    pubkey: PublicKey;
    account: AccountInfo<StakePool>;
}
declare function calcLamportsWithdrawAmount(stakePool: StakePool, poolTokens: number): number;
declare function getStakePoolAccount(connection: Connection, stakePoolPubKey: PublicKey): Promise<StakePoolAccount>;
declare function addAssociatedTokenAccount(connection: Connection, owner: PublicKey, mint: PublicKey, instructions: TransactionInstruction[]): Promise<PublicKey>;
declare function findWithdrawAuthorityProgramAddress(programId: PublicKey, stakePoolAddress: PublicKey): Promise<PublicKey>;
declare function getTokenAccount(connection: Connection, tokenAccountAddress: PublicKey, expectedTokenMint: PublicKey): Promise<any>;
declare function prepareWithdrawAccounts(connection: Connection, stakePool: StakePool, stakePoolAddress: PublicKey, amount: number): Promise<any>;
declare function newStakeAccount(CONNECTION: any, feePayer: PublicKey, instructions: TransactionInstruction[], lamports: number, numberOfStakeAccounts: number, incrementStakeAccount: any): Promise<PublicKey>;
export { getStakePoolAccount, addAssociatedTokenAccount, findWithdrawAuthorityProgramAddress, getTokenAccount, prepareWithdrawAccounts, calcLamportsWithdrawAmount, newStakeAccount, };

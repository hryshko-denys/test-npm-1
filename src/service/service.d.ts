import { PublicKey, Connection, AccountInfo, TransactionInstruction } from '@solana/web3.js';
import { StakePool } from '../layouts/index';
export interface StakePoolAccount {
  pubkey: PublicKey;
  account: AccountInfo<StakePool>;
}
declare function getStakePoolAccount(connection: Connection, stakePoolPubKey: PublicKey): Promise<StakePoolAccount>;
declare function addAssociatedTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  instructions: TransactionInstruction[],
): Promise<PublicKey>;
declare function findWithdrawAuthorityProgramAddress(
  programId: PublicKey,
  stakePoolAddress: PublicKey,
): Promise<PublicKey>;
export { getStakePoolAccount, addAssociatedTokenAccount, findWithdrawAuthorityProgramAddress };

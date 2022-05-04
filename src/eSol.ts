import { ESolConfig } from './config';
import { PublicKey, Transaction, Keypair, Signer, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { lamportsToSol } from './utils';
import { getStakePoolAccount } from './service/service';


export class ESol {
  constructor(public readonly config: ESolConfig = new ESolConfig()) {}

  async depositSol(
    userAddress: PublicKey,
    lamports: number,
    poolTokenReceiverAccount?: PublicKey,
    daoCommunityTokenReceiverAccount?: PublicKey,
    referrerTokenAccount?: PublicKey,
  ): Promise<Transaction> {
    const CONNECTION = this.config.connection;
    const transaction = new Transaction();


    const userSolBalance = await CONNECTION.getBalance(userAddress, 'confirmed');
    if (userSolBalance < lamports) {
      throw new Error(
        `Not enough SOL to deposit into pool. Maximum deposit amount is ${lamportsToSol(userSolBalance)} SOL.`,
      );
    }

    const stakePoolAddress = this.config.eSOLStakePoolAddress;
    const stakePool = await getStakePoolAccount(CONNECTION, stakePoolAddress);
    return transaction;
  }
}

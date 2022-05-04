import { PublicKey } from '@solana/web3.js';
import * as BN from 'bn.js';
export declare enum AccountType {
    Uninitialized = 0,
    StakePool = 1,
    ValidatorList = 2
}
export interface Lockup {
    unixTimestamp: number;
    epoch: number;
    custodian: PublicKey;
}
export interface Fee {
    denominator: BN;
    numerator: BN;
}
export interface RateOfExchange {
    denominator: BN;
    numerator: BN;
}
export interface StakePool {
    accountType: AccountType;
    manager: PublicKey;
    staker: PublicKey;
    stakeDepositAuthority: PublicKey;
    stakeWithdrawBumpSeed: number;
    validatorList: PublicKey;
    reserveStake: PublicKey;
    poolMint: PublicKey;
    managerFeeAccount: PublicKey;
    tokenProgramId: PublicKey;
    totalLamports: BN;
    poolTokenSupply: BN;
    lastUpdateEpoch: BN;
    lockup: Lockup;
    epochFee: Fee;
    nextEpochFee?: Fee | undefined;
    preferredDepositValidatorVoteAddress?: PublicKey | undefined;
    preferredWithdrawValidatorVoteAddress?: PublicKey | undefined;
    stakeDepositFee: Fee;
    stakeWithdrawalFee: Fee;
    nextWithdrawalFee?: Fee | undefined;
    stakeReferralFee: number;
    solDepositAuthority?: PublicKey | undefined;
    solDepositFee: Fee;
    solReferralFee: number;
    solWithdrawAuthority?: PublicKey | undefined;
    solWithdrawalFee: Fee;
    nextSolWithdrawalFee?: Fee | undefined;
    lastEpochPoolTokenSupply: BN;
    lastEpochTotalLamports: BN;
    rateOfExchange?: RateOfExchange | undefined;
    treasuryFeeAccount: PublicKey;
    treasuryFee: Fee;
    totalLamportsLiquidity: BN;
}
export declare const STAKE_POOL_LAYOUT: any;

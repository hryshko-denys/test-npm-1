import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export interface Fee {
    denominator: BN;
    numerator: BN;
}
export interface RateOfExchange {
    denominator: BN;
    numerator: BN;
}
export interface DaoState {
    isEnabled: boolean;
}
export interface CommunityToken {
    tokenMint: PublicKey;
}
export interface Lockup {
    unixTimestamp: number;
    epoch: number;
    custodian: PublicKey;
}
export interface TokenAccount {
    mint: PublicKey;
    owner: PublicKey;
    amount: BN;
    delegate?: PublicKey | undefined;
    state: number;
    delegatedAmount?: BN | undefined;
    closeAuthority?: PublicKey | undefined;
}
export declare const ACCOUNT_LAYOUT: any;
export declare const DAO_STATE_LAYOUT: any;
export declare const COMMUNITY_TOKEN_LAYOUT: any;
export declare const STAKE_POOL_LAYOUT: any;
export interface ValidatorStakeInfo {
    status: number;
    voteAccountAddress: PublicKey;
    activeStakeLamports: BN;
    transientStakeLamports?: BN;
    transientSeedSuffixStart?: BN;
    transientSeedSuffixEnd?: BN;
    lastUpdateEpoch: BN;
}
export declare const VALIDATOR_STAKE_INFO_LAYOUT: any;
export interface ValidatorList {
    accountType: number;
    maxValidators: number;
    validators: ValidatorStakeInfo[];
}
export declare const VALIDATOR_LIST_LAYOUT: any;
export declare enum ValidatorStakeInfoStatus {
    Active = 0,
    DeactivatingTransient = 1,
    ReadyForRemoval = 2
}

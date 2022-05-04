/// <reference types="node" />
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import * as BufferLayout from '@solana/buffer-layout';
import { Buffer } from 'buffer';
export declare type InstructionType = {
  /** The Instruction index (from solana upstream program) */
  index: number;
  /** The BufferLayout to use to build data */
  layout: BufferLayout.Layout;
};
declare type WithdrawStakeParams = {
  stakePool: PublicKey;
  validatorList: PublicKey;
  withdrawAuthority: PublicKey;
  validatorStake: PublicKey;
  destinationStake: PublicKey;
  destinationStakeAuthority: PublicKey;
  sourceTransferAuthority: PublicKey;
  sourcePoolAccount: PublicKey;
  managerFeeAccount: PublicKey;
  poolMint: PublicKey;
  poolTokens: number;
};
declare type WithdrawStakeWithDaoParams = {
  daoCommunityTokenReceiverAccount: PublicKey;
  communityTokenStakingRewards: PublicKey;
  ownerWallet: PublicKey;
  communityTokenPubkey: PublicKey;
  stakePool: PublicKey;
  validatorList: PublicKey;
  withdrawAuthority: PublicKey;
  validatorStake: PublicKey;
  destinationStake: PublicKey;
  destinationStakeAuthority: PublicKey;
  sourceTransferAuthority: PublicKey;
  sourcePoolAccount: PublicKey;
  managerFeeAccount: PublicKey;
  poolMint: PublicKey;
  poolTokens: number;
};
/**
 * Populate a buffer of instruction data using an InstructionType
 * @internal
 */
export declare function encodeData(type: InstructionType, fields?: any): Buffer;
/**
 * Decode instruction data buffer using an InstructionType
 * @internal
 */
export declare function decodeData(type: InstructionType, buffer: Buffer): any;
/**
 * An enumeration of valid StakePoolInstructionType's
 */
export declare type StakePoolInstructionType =
  | 'Initialize'
  | 'Deposit'
  | 'DepositSol'
  | 'WithdrawStake'
  | 'WithdrawStakeWithDao'
  | 'WithdrawSol'
  | 'SetFundingAuthority'
  | 'CreateCommunityTokenStakingRewards'
  | 'DepositSolDao'
  | 'WithdrawSolWithDao';
/**
 * Defines which deposit authority to update in the `SetDepositAuthority`
 */
export declare enum DepositType {
  Stake = 0,
  Sol = 1,
}
/**
 * An enumeration of valid stake InstructionType's
 * @internal
 */
export declare const STAKE_POOL_INSTRUCTION_LAYOUTS: {
  [type in StakePoolInstructionType]: InstructionType;
};
/**
 * Initialize stake instruction params
 */
export declare type InitializeStakePoolParams = {
  feeDenominator: number;
  feeNumerator: number;
  withdrawalDenominator: number;
  withdrawalNumerator: number;
  maxValidators: number;
};
/**
 * Deposit stake pool instruction params
 */
export declare type DepositStakePoolParams = {
  stakePoolPubkey: PublicKey;
  validatorListStorage: PublicKey;
  stakePoolDepositAuthority: PublicKey;
  stakePoolWithdrawAuthority: PublicKey;
  depositStakeAddress: PublicKey;
  depositStakeWithdrawAuthority: PublicKey;
  validatorStakeAccount: PublicKey;
  reserveStakeAccount: PublicKey;
  poolTokensTo: PublicKey;
  poolMint: PublicKey;
};
/**
 * Withdraw stake pool instruction params
 */
export declare type WithdrawStakePoolParams = {
  stakePoolPubkey: PublicKey;
  validatorListStorage: PublicKey;
  stakePoolWithdrawAuthority: PublicKey;
  stakeToSplit: PublicKey;
  stakeToReceive: PublicKey;
  userStakeAuthority: PublicKey;
  userTransferAuthority: PublicKey;
  userPoolTokenAccount: PublicKey;
  managerFeeAccount: PublicKey;
  poolMint: PublicKey;
  lamports: number;
};
export declare type WithdrawStakeWithDaoPoolParams = {
  daoCommunityTokenReceiverAccount: PublicKey;
  communityTokenStakingRewards: PublicKey;
  ownerWallet: PublicKey;
  communityTokenPubkey: PublicKey;
  stakePoolPubkey: PublicKey;
  validatorListStorage: PublicKey;
  stakePoolWithdrawAuthority: PublicKey;
  stakeToSplit: PublicKey;
  stakeToReceive: PublicKey;
  userStakeAuthority: PublicKey;
  userTransferAuthority: PublicKey;
  userPoolTokenAccount: PublicKey;
  managerFeeAccount: PublicKey;
  poolMint: PublicKey;
  lamports: number;
};
/**
 * Withdraw sol instruction params
 */
export declare type WithdrawSolParams = {
  stakePoolPubkey: PublicKey;
  solWithdrawAuthority: PublicKey | undefined;
  stakePoolWithdrawAuthority: PublicKey;
  userTransferAuthority: PublicKey;
  poolTokensFrom: PublicKey;
  reserveStakeAccount: PublicKey;
  lamportsTo: PublicKey;
  managerFeeAccount: PublicKey;
  poolMint: PublicKey;
  poolTokens: number;
};
export declare type WithdrawSolWithDaoParams = {
  daoCommunityTokenReceiverAccount: PublicKey;
  communityTokenStakingRewards: PublicKey;
  ownerWallet: PublicKey;
  communityTokenPubkey: PublicKey;
  stakePoolPubkey: PublicKey;
  solWithdrawAuthority: PublicKey | undefined;
  stakePoolWithdrawAuthority: PublicKey;
  userTransferAuthority: PublicKey;
  poolTokensFrom: PublicKey;
  reserveStakeAccount: PublicKey;
  lamportsTo: PublicKey;
  managerFeeAccount: PublicKey;
  poolMint: PublicKey;
  poolTokens: number;
};
/**
 * Deposit sol instruction params
 */
export declare type DepositSolParams = {
  stakePoolPubkey: PublicKey;
  depositAuthority?: PublicKey;
  withdrawAuthority: PublicKey;
  reserveStakeAccount: PublicKey;
  lamportsFrom: PublicKey;
  poolTokensTo: PublicKey;
  managerFeeAccount: PublicKey;
  referrerPoolTokensAccount: PublicKey;
  poolMint: PublicKey;
  lamports: number;
};
export declare type DepositSolDaoParams = {
  daoCommunityTokenReceiverAccount: PublicKey;
  communityTokenStakingRewards: PublicKey;
  ownerWallet: PublicKey;
  communityTokenPubkey: PublicKey;
  stakePoolPubkey: PublicKey;
  depositAuthority?: PublicKey;
  withdrawAuthority: PublicKey;
  reserveStakeAccount: PublicKey;
  lamportsFrom: PublicKey;
  poolTokensTo: PublicKey;
  managerFeeAccount: PublicKey;
  referrerPoolTokensAccount: PublicKey;
  poolMint: PublicKey;
  lamports: number;
};
export declare type CreateCommunityTokenStakingRewardsParams = {
  stakePoolPubkey: PublicKey;
  ownerWallet: PublicKey;
  communityTokenStakingRewardsDTO: PublicKey;
  communityTokenStakingRewardsCounterDTO: PublicKey;
};
export declare const toBuffer: (arr: Buffer | Uint8Array | number[]) => Buffer;
/**
 * Factory class for transactions to interact with the Stake program
 */
export declare class StakePoolProgram {
  /**
   * Public key that identifies the Stake Pool program
   */
  static programId: PublicKey;
  static tokenProgramId: PublicKey;
  static stakeProgramId: PublicKey;
  static changeProgramId(id: string): void;
  static initialize(params: InitializeStakePoolParams): Transaction;
  static deposit(params: DepositStakePoolParams): Transaction;
  static depositSolInstruction(params: DepositSolParams): TransactionInstruction;
  static depositSolDaoInstruction(params: DepositSolDaoParams): TransactionInstruction;
  static withdrawStakeInstruction(params: WithdrawStakePoolParams): TransactionInstruction;
  static withdrawStake(params: WithdrawStakeParams): TransactionInstruction;
  static withdrawStakeWithDao(params: WithdrawStakeWithDaoParams): TransactionInstruction;
  static withdrawSolInstruction(params: WithdrawSolParams): TransactionInstruction;
  static withdrawSolWithDaoInstruction(params: WithdrawSolWithDaoParams): TransactionInstruction;
  static createCommunityTokenStakingRewards(params: CreateCommunityTokenStakingRewardsParams): TransactionInstruction;
}
export {};

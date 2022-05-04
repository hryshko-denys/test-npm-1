import { publicKey, struct, u64, u8, option } from '@project-serum/borsh';
export var AccountType;
(function (AccountType) {
    AccountType[AccountType["Uninitialized"] = 0] = "Uninitialized";
    AccountType[AccountType["StakePool"] = 1] = "StakePool";
    AccountType[AccountType["ValidatorList"] = 2] = "ValidatorList";
})(AccountType || (AccountType = {}));
const feeFields = [u64('denominator'), u64('numerator')];
const rateOfExchangeFields = [u64('denominator'), u64('numerator')];
export const STAKE_POOL_LAYOUT = struct([
    // rustEnum(AccountTypeKind, 'accountType'),
    u8('accountType'),
    publicKey('manager'),
    publicKey('staker'),
    publicKey('stakeDepositAuthority'),
    u8('stakeWithdrawBumpSeed'),
    publicKey('validatorList'),
    publicKey('reserveStake'),
    publicKey('poolMint'),
    publicKey('managerFeeAccount'),
    publicKey('tokenProgramId'),
    u64('totalLamports'),
    u64('poolTokenSupply'),
    u64('lastUpdateEpoch'),
    struct([u64('unixTimestamp'), u64('epoch'), publicKey('custodian')], 'lockup'),
    struct(feeFields, 'epochFee'),
    option(struct(feeFields), 'nextEpochFee'),
    option(publicKey(), 'preferredDepositValidatorVoteAddress'),
    option(publicKey(), 'preferredWithdrawValidatorVoteAddress'),
    struct(feeFields, 'stakeDepositFee'),
    struct(feeFields, 'stakeWithdrawalFee'),
    option(struct(feeFields), 'nextWithdrawalFee'),
    u8('stakeReferralFee'),
    option(publicKey(), 'solDepositAuthority'),
    struct(feeFields, 'solDepositFee'),
    u8('solReferralFee'),
    option(publicKey(), 'solWithdrawAuthority'),
    struct(feeFields, 'solWithdrawalFee'),
    option(struct(feeFields), 'nextSolWithdrawalFee'),
    u64('lastEpochPoolTokenSupply'),
    u64('lastEpochTotalLamports'),
    option(struct(rateOfExchangeFields), 'rateOfExchange'),
    publicKey('treasuryFeeAccount'),
    struct(feeFields, 'treasuryFee'),
    u64('totalLamportsLiquidity'),
]);

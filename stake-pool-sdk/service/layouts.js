import { publicKey, struct, u32, u64, u8, option, vec, bool } from '@project-serum/borsh';
const feeFields = [u64('denominator'), u64('numerator')];
const rateOfExchangeFields = [u64('denominator'), u64('numerator')];
export const ACCOUNT_LAYOUT = struct([
    publicKey('mint'),
    publicKey('owner'),
    u64('amount'),
    u32('delegateOption'),
    publicKey('delegate'),
    u8('state'),
    u32('isNativeOption'),
    u64('isNative'),
    u64('delegatedAmount'),
    u32('closeAuthorityOption'),
    publicKey('closeAuthority'),
]);
export var AccountType;
(function (AccountType) {
    AccountType[AccountType["Uninitialized"] = 0] = "Uninitialized";
    AccountType[AccountType["StakePool"] = 1] = "StakePool";
    AccountType[AccountType["ValidatorList"] = 2] = "ValidatorList";
})(AccountType || (AccountType = {}));
export const DAO_STATE_LAYOUT = struct([bool('isEnabled')]);
export const COMMUNITY_TOKEN_LAYOUT = struct([publicKey('tokenMint')]);
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
export const VALIDATOR_STAKE_INFO_LAYOUT = struct([
    /// Amount of active stake delegated to this validator
    /// Note that if `last_update_epoch` does not match the current epoch then
    /// this field may not be accurate
    u64('activeStakeLamports'),
    /// Amount of transient stake delegated to this validator
    /// Note that if `last_update_epoch` does not match the current epoch then
    /// this field may not be accurate
    u64('transientStakeLamports'),
    /// Last epoch the active and transient stake lamports fields were updated
    u64('lastUpdateEpoch'),
    /// Start of the validator transient account seed suffixes
    u64('transientSeedSuffixStart'),
    /// End of the validator transient account seed suffixes
    u64('transientSeedSuffixEnd'),
    /// Status of the validator stake account
    // rustEnum([
    //   struct([], 'Active'),
    //   struct([], 'DeactivatingTransient'),
    //   struct([], 'ReadyForRemoval'),
    // ]).replicate('status'),
    u8('status'),
    /// Validator vote account address
    publicKey('voteAccountAddress'),
]);
export const VALIDATOR_LIST_LAYOUT = struct([
    // rustEnum([
    //   struct([], 'Uninitialized'),
    //   struct([], 'StakePool'),
    //   struct([], 'ValidatorList'),
    // ]).replicate('accountType'),
    u8('accountType'),
    u32('maxValidators'),
    vec(VALIDATOR_STAKE_INFO_LAYOUT, 'validators'),
]);
export var ValidatorStakeInfoStatus;
(function (ValidatorStakeInfoStatus) {
    ValidatorStakeInfoStatus[ValidatorStakeInfoStatus["Active"] = 0] = "Active";
    ValidatorStakeInfoStatus[ValidatorStakeInfoStatus["DeactivatingTransient"] = 1] = "DeactivatingTransient";
    ValidatorStakeInfoStatus[ValidatorStakeInfoStatus["ReadyForRemoval"] = 2] = "ReadyForRemoval";
})(ValidatorStakeInfoStatus || (ValidatorStakeInfoStatus = {}));

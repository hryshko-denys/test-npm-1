import { PublicKey, SystemProgram, StakeProgram, } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { STAKE_POOL_LAYOUT, ACCOUNT_LAYOUT, VALIDATOR_LIST_LAYOUT, ValidatorStakeInfoStatus, } from '../layouts/index';
import { findTransientStakeProgramAddress } from './program-address';
import { StakePoolProgram } from './stakepool-program';
import BN from 'bn.js';
const FAILED_TO_FIND_ACCOUNT = 'Failed to find account';
const INVALID_ACCOUNT_OWNER = 'Invalid account owner';
async function findStakeProgramAddress(programId, voteAccountAddress, stakePoolAddress) {
    const [publicKey] = await PublicKey.findProgramAddress([voteAccountAddress.toBuffer(), stakePoolAddress.toBuffer()], programId);
    return publicKey;
}
function calcLamportsWithdrawAmount(stakePool, poolTokens) {
    const numerator = new BN(poolTokens).mul(stakePool.totalLamports);
    const denominator = stakePool.poolTokenSupply;
    if (numerator.lt(denominator)) {
        return 0;
    }
    return divideBnToNumber(numerator, denominator);
}
function calcPoolTokensForDeposit(stakePool, stakeLamports) {
    if (stakePool.poolTokenSupply.isZero() || stakePool.totalLamports.isZero()) {
        return stakeLamports;
    }
    return divideBnToNumber(new BN(stakeLamports).mul(stakePool.poolTokenSupply), stakePool.totalLamports);
}
function divideBnToNumber(numerator, denominator) {
    if (denominator.isZero()) {
        return 0;
    }
    const quotient = numerator.div(denominator).toNumber();
    const rem = numerator.umod(denominator);
    const gcd = rem.gcd(denominator);
    return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}
async function getStakePoolAccount(connection, stakePoolPubKey) {
    const account = await connection.getAccountInfo(stakePoolPubKey);
    if (!account) {
        throw new Error('Invalid account');
    }
    return {
        pubkey: stakePoolPubKey,
        account: {
            data: STAKE_POOL_LAYOUT.decode(account.data),
            executable: account.executable,
            lamports: account.lamports,
            owner: account.owner,
        },
    };
}
async function addAssociatedTokenAccount(connection, owner, mint, instructions) {
    const associatedAddress = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner);
    // This is the optimum logic, considering TX fee, client-side computation,
    // RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically;
    try {
        const account = await connection.getAccountInfo(associatedAddress);
        if (!account) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(FAILED_TO_FIND_ACCOUNT);
        }
    }
    catch (err) {
        // INVALID_ACCOUNT_OWNER can be possible if the associatedAddress has
        // already been received some lamports (= became system accounts).
        // Assuming program derived addressing is safe, this is the only case
        // for the INVALID_ACCOUNT_OWNER in this code-path
        if (err.message === FAILED_TO_FIND_ACCOUNT || err.message === INVALID_ACCOUNT_OWNER) {
            // as this isn't atomic, it's possible others can create associated
            // accounts meanwhile
            try {
                instructions.push(Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, associatedAddress, owner, owner));
            }
            catch (errr) {
                // console.error(errr);
                // ignore all errors; for now there is no API compatible way to
                // selectively ignore the expected instruction error if the
                // associated account is existing already.
            }
            // Now this should always succeed
            // await connection.getAccountInfo(associatedAddress);
        }
        else {
            throw err;
        }
        // console.error(err);
    }
    return associatedAddress;
}
async function findWithdrawAuthorityProgramAddress(programId, stakePoolAddress) {
    const [publicKey] = await PublicKey.findProgramAddress([stakePoolAddress.toBuffer(), Buffer.from('withdraw')], programId);
    return publicKey;
}
async function getTokenAccount(connection, tokenAccountAddress, expectedTokenMint) {
    var _a;
    try {
        const account = await connection.getAccountInfo(tokenAccountAddress);
        if (!account) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(`Invalid account ${tokenAccountAddress.toBase58()}`);
        }
        const tokenAccount = ACCOUNT_LAYOUT.decode(account.data);
        if (((_a = tokenAccount.mint) === null || _a === void 0 ? void 0 : _a.toBase58()) !== expectedTokenMint.toBase58()) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error(`Invalid token mint for ${tokenAccountAddress}, expected mint is ${expectedTokenMint}`);
        }
        return tokenAccount;
    }
    catch (error) {
        // console.error(error)
    }
}
async function prepareWithdrawAccounts(connection, stakePool, stakePoolAddress, amount) {
    var _a;
    const validatorListAcc = await connection.getAccountInfo(stakePool.validatorList);
    const validatorList = VALIDATOR_LIST_LAYOUT.decode(validatorListAcc.data);
    if (!(validatorList === null || validatorList === void 0 ? void 0 : validatorList.validators) || (validatorList === null || validatorList === void 0 ? void 0 : validatorList.validators.length) === 0) {
        throw new Error('No accounts found');
    }
    let accounts = [];
    // Prepare accounts
    for (const validator of validatorList.validators) {
        if (validator.status !== ValidatorStakeInfoStatus.Active) {
            continue;
        }
        const stakeAccountAddress = await findStakeProgramAddress(StakePoolProgram.programId, validator.voteAccountAddress, stakePoolAddress);
        if (!validator.activeStakeLamports.isZero()) {
            const isPreferred = stakePool.preferredWithdrawValidatorVoteAddress &&
                stakePool.preferredWithdrawValidatorVoteAddress.toBase58() === validator.voteAccountAddress.toBase58();
            accounts.push({
                type: isPreferred ? 'preferred' : 'active',
                voteAddress: validator.voteAccountAddress,
                stakeAddress: stakeAccountAddress,
                lamports: validator.activeStakeLamports.toNumber(),
            });
        }
        const transientStakeAccountAddress = await findTransientStakeProgramAddress(StakePoolProgram.programId, validator.voteAccountAddress, stakePoolAddress, validator.transientSeedSuffixStart);
        if (!((_a = validator.transientStakeLamports) === null || _a === void 0 ? void 0 : _a.isZero())) {
            accounts.push({
                type: 'transient',
                voteAddress: validator.voteAccountAddress,
                stakeAddress: transientStakeAccountAddress,
                lamports: validator.transientStakeLamports.toNumber(),
            });
        }
    }
    // Sort from highest to lowest balance
    accounts = accounts.sort((a, b) => b.lamports - a.lamports);
    // const reserveStake = await connection.getAccountInfo(stakePool.reserveStake);
    // if (reserveStake && reserveStake.lamports > 0) {
    //   accounts.push({
    //     type: "reserve",
    //     stakeAddress: stakePool.reserveStake,
    //     lamports: reserveStake?.lamports,
    //   });
    // }
    // Prepare the list of accounts to withdraw from
    // const withdrawFrom: WithdrawAccount[] = [];
    let withdrawFrom;
    const remainingAmount = amount;
    // for (const type of ["preferred", "active", "transient", "reserve"]) {
    for (const type of ['active']) {
        const filteredAccounts = accounts.filter((a) => a.type === type);
        for (const { stakeAddress, voteAddress, lamports } of filteredAccounts) {
            let availableForWithdrawal = Math.floor(calcPoolTokensForDeposit(stakePool, lamports));
            if (!stakePool.stakeWithdrawalFee.denominator.isZero()) {
                availableForWithdrawal = divideBnToNumber(new BN(availableForWithdrawal).mul(stakePool.stakeWithdrawalFee.denominator), stakePool.stakeWithdrawalFee.denominator.sub(stakePool.stakeWithdrawalFee.numerator));
            }
            const poolAmount = Math.min(availableForWithdrawal, remainingAmount);
            if (poolAmount <= 0) {
                continue;
            }
            // Those accounts will be withdrawn completely with `claim` instruction
            withdrawFrom = { stakeAddress, voteAddress, poolAmount };
            // new
            break;
            // remainingAmount -= poolAmount;
            // if (remainingAmount == 0) {
            //   break;
            // }
        }
        if (remainingAmount === 0) {
            break;
        }
    }
    // Not enough stake to withdraw the specified amount
    // if (remainingAmount > 0) {
    //   throw new Error(
    //     `No stake accounts found in this pool with enough balance to withdraw ${lamportsToSol(
    //       amount,
    //     )} pool tokens.`,
    //   );
    // }
    return withdrawFrom;
}
async function newStakeAccount(CONNECTION, feePayer, instructions, lamports, numberOfStakeAccounts, incrementStakeAccount) {
    // Account for tokens not specified, creating one
    const programId = StakePoolProgram.programId.toString();
    let counter = numberOfStakeAccounts;
    let stakeReceiverPubkey;
    let seed;
    while (counter < 12) {
        seed = `${feePayer.toString().slice(0, 4)}${programId.slice(0, 4)}everstake${counter}`;
        stakeReceiverPubkey = await PublicKey.createWithSeed(feePayer, seed, StakeProgram.programId);
        const stakeAccount = await CONNECTION.getAccountInfo(stakeReceiverPubkey);
        if (stakeAccount) {
            incrementStakeAccount();
            counter++;
        }
        else {
            break;
        }
    }
    incrementStakeAccount();
    if (counter === 12) {
        throw Error('This transaction cannot be processed due to the withdrawal accounts limit. Try to use the “Instant unstake” or wait for a new epoch to undelegate. You can also withdraw already deactivated SOL if you have any.');
    }
    // Creating new account
    instructions.push(SystemProgram.createAccountWithSeed({
        fromPubkey: feePayer,
        newAccountPubkey: stakeReceiverPubkey,
        basePubkey: feePayer,
        seed,
        lamports,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
    }));
    return stakeReceiverPubkey;
}
export { getStakePoolAccount, addAssociatedTokenAccount, findWithdrawAuthorityProgramAddress, getTokenAccount, prepareWithdrawAccounts, calcLamportsWithdrawAmount, newStakeAccount, };

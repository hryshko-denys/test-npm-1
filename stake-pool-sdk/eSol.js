import { ESolConfig } from './config';
import { PublicKey, Transaction, Keypair, SystemProgram, StakeProgram, } from '@solana/web3.js';
import { lamportsToSol, solToLamports } from './utils';
import { getStakePoolAccount, addAssociatedTokenAccount, findWithdrawAuthorityProgramAddress, getTokenAccount, prepareWithdrawAccounts, calcLamportsWithdrawAmount, newStakeAccount, } from './service/service';
import { StakePoolProgram } from './service/stakepool-program';
import { DAO_STATE_LAYOUT, COMMUNITY_TOKEN_LAYOUT } from './service/layouts';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
export class ESol {
    constructor(clusterType = 'testnet') {
        this.config = new ESolConfig(clusterType);
    }
    async depositSol(userAddress, lamports, poolTokenReceiverAccount, daoCommunityTokenReceiverAccount, referrerTokenAccount) {
        const CONNECTION = this.config.connection;
        const userSolBalance = await CONNECTION.getBalance(userAddress, 'confirmed');
        if (userSolBalance < lamports) {
            throw new Error(`Not enough SOL to deposit into pool. Maximum deposit amount is ${lamportsToSol(userSolBalance)} SOL.`);
        }
        const stakePoolAddress = this.config.eSOLStakePoolAddress;
        const stakePool = await getStakePoolAccount(CONNECTION, stakePoolAddress);
        const userSolTransfer = new Keypair();
        const signers = [userSolTransfer];
        const instructions = [];
        // Check user balance
        const lamportsToLeftInWallet = 3000000;
        let needForTransaction = lamportsToLeftInWallet;
        const daoCommunityTokenReceiverAccountRentSpace = await CONNECTION.getMinimumBalanceForRentExemption(165);
        if (!daoCommunityTokenReceiverAccount) {
            needForTransaction += daoCommunityTokenReceiverAccountRentSpace;
        }
        if (!poolTokenReceiverAccount) {
            const poolTokenReceiverAccountRentSpace = await CONNECTION.getMinimumBalanceForRentExemption(165);
            needForTransaction += poolTokenReceiverAccountRentSpace;
        }
        if (userSolBalance < lamports + needForTransaction) {
            lamports -= needForTransaction;
        }
        // Check dao stake accounts
        const seedPrefixDaoState = this.config.seedPrefixDaoState;
        const daoStateDtoInfo = await PublicKey.findProgramAddress([Buffer.from(seedPrefixDaoState), stakePoolAddress.toBuffer(), StakePoolProgram.programId.toBuffer()], StakePoolProgram.programId);
        const daoStateDtoPubkey = daoStateDtoInfo[0];
        const daoStateDtoInfoAccount = await CONNECTION.getAccountInfo(daoStateDtoPubkey);
        if (!daoStateDtoInfoAccount) {
            throw Error("Didn't find dao state account");
        }
        const daoState = DAO_STATE_LAYOUT.decode(daoStateDtoInfoAccount.data);
        const isDaoEnabled = daoState.isEnabled;
        if (!isDaoEnabled) {
            throw Error('Dao is not enable'); // it should never happened!!!
        }
        const seedPrefixCommunityToken = this.config.seedPrefixCommunityToken;
        const communityTokenDtoInfo = await PublicKey.findProgramAddress([Buffer.from(seedPrefixCommunityToken), stakePoolAddress.toBuffer(), StakePoolProgram.programId.toBuffer()], StakePoolProgram.programId);
        const communityTokenPubkey = communityTokenDtoInfo[0];
        const communityTokenAccount = await CONNECTION.getAccountInfo(communityTokenPubkey);
        if (!communityTokenAccount) {
            throw Error('Community token is not exist'); // if isDaoEnabled -> error should NOT happened
        }
        const communityTokenInfo = COMMUNITY_TOKEN_LAYOUT.decode(communityTokenAccount.data);
        // CommunityTokenStakingRewards
        // Account Data length = 105 bytes
        const seedPrefixCommunityTokenStakingRewards = this.config.seedPrefixCommunityTokenStakingRewards;
        const communityTokenStakingRewardsInfo = await PublicKey.findProgramAddress([
            Buffer.from(seedPrefixCommunityTokenStakingRewards),
            stakePoolAddress.toBuffer(),
            userAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityTokenStakingRewardsPubkey = communityTokenStakingRewardsInfo[0];
        const communityTokenStakingRewardsAccount = await CONNECTION.getAccountInfo(communityTokenStakingRewardsPubkey);
        // communityTokenStakingRewardsCounter
        const seedPrefixCommunityTokenStakingRewardsCounter = this.config.seedPrefixCommunityTokenStakingRewardsCounter;
        const communityTokenStakingRewardsCounterDtoInfo = await PublicKey.findProgramAddress([
            Buffer.from(seedPrefixCommunityTokenStakingRewardsCounter),
            stakePoolAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityStakingRewardsCounterPubkey = communityTokenStakingRewardsCounterDtoInfo[0];
        const communityTokenStakingRewardsCounterAccount = await CONNECTION.getAccountInfo(communityStakingRewardsCounterPubkey);
        if (!communityTokenStakingRewardsCounterAccount) {
            throw Error('Community token staking reward counter is not exist'); // if isDaoEnabled -> error should NOT happened
        }
        if (!communityTokenStakingRewardsAccount) {
            // create CommunityTokenStakingRewards
            instructions.push(StakePoolProgram.createCommunityTokenStakingRewards({
                stakePoolPubkey: stakePoolAddress,
                ownerWallet: userAddress,
                communityTokenStakingRewardsDTO: communityTokenStakingRewardsPubkey,
                communityTokenStakingRewardsCounterDTO: communityStakingRewardsCounterPubkey,
            }));
        }
        instructions.push(SystemProgram.transfer({
            fromPubkey: userAddress,
            toPubkey: userSolTransfer.publicKey,
            lamports,
        }));
        const { poolMint } = stakePool.account.data;
        // check associatedTokenAccount for RENT 165 BYTES FOR RENTs
        if (!poolTokenReceiverAccount) {
            poolTokenReceiverAccount = await addAssociatedTokenAccount(CONNECTION, userAddress, poolMint, instructions);
        }
        // check associatedTokenAccount for RENT 165 BYTES FOR RENTs
        if (!daoCommunityTokenReceiverAccount) {
            daoCommunityTokenReceiverAccount = await addAssociatedTokenAccount(CONNECTION, userAddress, communityTokenInfo.tokenMint, instructions);
        }
        const withdrawAuthority = await findWithdrawAuthorityProgramAddress(StakePoolProgram.programId, stakePoolAddress);
        instructions.push(StakePoolProgram.depositSolDaoInstruction({
            daoCommunityTokenReceiverAccount,
            communityTokenStakingRewards: communityTokenStakingRewardsPubkey,
            ownerWallet: userAddress,
            communityTokenPubkey,
            stakePoolPubkey: stakePoolAddress,
            depositAuthority: undefined,
            withdrawAuthority,
            reserveStakeAccount: stakePool.account.data.reserveStake,
            lamportsFrom: userSolTransfer.publicKey,
            poolTokensTo: poolTokenReceiverAccount,
            managerFeeAccount: stakePool.account.data.managerFeeAccount,
            referrerPoolTokensAccount: referrerTokenAccount !== null && referrerTokenAccount !== void 0 ? referrerTokenAccount : poolTokenReceiverAccount,
            poolMint,
            lamports,
        }));
        const transaction = new Transaction();
        instructions.forEach((instruction) => transaction.add(instruction));
        transaction.feePayer = userAddress;
        transaction.recentBlockhash = (await CONNECTION.getRecentBlockhash()).blockhash;
        transaction.sign(...signers);
        return transaction;
    }
    async unDelegateSol(userAddress, lamports, solWithdrawAuthority) {
        const CONNECTION = this.config.connection;
        const tokenOwner = userAddress;
        const solReceiver = userAddress;
        const stakePoolAddress = this.config.eSOLStakePoolAddress;
        const stakePool = await getStakePoolAccount(CONNECTION, stakePoolAddress);
        const poolAmount = solToLamports(lamports);
        // dao part
        const daoStateDtoInfo = await PublicKey.findProgramAddress([Buffer.from(this.config.seedPrefixDaoState), stakePoolAddress.toBuffer(), StakePoolProgram.programId.toBuffer()], StakePoolProgram.programId);
        const daoStateDtoPubkey = daoStateDtoInfo[0];
        const daoStateDtoInfoAccount = await CONNECTION.getAccountInfo(daoStateDtoPubkey);
        if (!daoStateDtoInfoAccount) {
            throw Error("Didn't find dao state account");
        }
        const daoState = DAO_STATE_LAYOUT.decode(daoStateDtoInfoAccount.data);
        const isDaoEnabled = daoState.isEnabled;
        if (!isDaoEnabled) {
            throw Error('Dao is not enable'); // it should never happened!!!
        }
        const reserveStake = await CONNECTION.getAccountInfo(stakePool.account.data.reserveStake);
        const stakeReceiverAccountBalance = await CONNECTION.getMinimumBalanceForRentExemption(StakeProgram.space);
        const rateOfExchange = stakePool.account.data.rateOfExchange;
        const rate = rateOfExchange ? rateOfExchange.numerator.toNumber() / rateOfExchange.denominator.toNumber() : 1;
        const solToWithdraw = poolAmount * rate;
        if ((reserveStake === null || reserveStake === void 0 ? void 0 : reserveStake.lamports) || (reserveStake === null || reserveStake === void 0 ? void 0 : reserveStake.lamports) === 0) {
            const availableAmount = (reserveStake === null || reserveStake === void 0 ? void 0 : reserveStake.lamports) - stakeReceiverAccountBalance;
            if (availableAmount < solToWithdraw) {
                const availableTokenAmount = +availableAmount / +rate;
                throw new Error(`Not enough balance in the pool reserve account. The MAX available amount to withdraw is ${lamportsToSol(+availableTokenAmount).toFixed(3)}. To undelegate larger amount of tokens, please proceed to the regular “Unstake” tab`);
            }
        }
        const poolTokenAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, stakePool.account.data.poolMint, tokenOwner);
        const tokenAccount = await getTokenAccount(CONNECTION, poolTokenAccount, stakePool.account.data.poolMint);
        if (!tokenAccount) {
            throw new Error('Invalid token account');
        }
        // Check withdrawFrom balance
        if (tokenAccount.amount.toNumber() < poolAmount) {
            throw new Error(`Not enough token balance to withdraw ${lamportsToSol(poolAmount)} pool tokens.
          Maximum withdraw amount is ${lamportsToSol(tokenAccount.amount.toNumber())} pool tokens.`);
        }
        // Construct transaction to withdraw from withdrawAccounts account list
        const instructions = [];
        const userTransferAuthority = Keypair.generate();
        const signers = [userTransferAuthority];
        // dao
        const communityTokenStakingRewardsInfo = await PublicKey.findProgramAddress([
            Buffer.from(this.config.seedPrefixCommunityTokenStakingRewards),
            stakePoolAddress.toBuffer(),
            tokenOwner.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityTokenStakingRewardsPubkey = communityTokenStakingRewardsInfo[0];
        const communityTokenStakingRewardsAccount = await CONNECTION.getAccountInfo(communityTokenStakingRewardsPubkey);
        // We can be sure that this account already exists, as it is created when you deposit.
        // But there are some number of users who made a deposit before updating the code with DAO strategy,
        // so here we create an account especially for them.
        // {
        const communityTokenDtoInfo = await PublicKey.findProgramAddress([
            Buffer.from(this.config.seedPrefixCommunityToken),
            stakePoolAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityTokenPubkey = communityTokenDtoInfo[0];
        const communityTokenAccount = await CONNECTION.getAccountInfo(communityTokenPubkey);
        if (!communityTokenAccount) {
            throw Error('Community token is not exist'); // if isDaoEnabled -> error should NOT happened
        }
        const communityTokenInfo = COMMUNITY_TOKEN_LAYOUT.decode(communityTokenAccount.data);
        // check associatedTokenAccount for RENT 165 BYTES FOR RENTs
        const daoCommunityTokenReceiverAccount = await addAssociatedTokenAccount(CONNECTION, tokenOwner, communityTokenInfo.tokenMint, instructions);
        // communityTokenStakingRewardsCounter
        const communityTokenStakingRewardsCounterDtoInfo = await PublicKey.findProgramAddress([
            Buffer.from(this.config.seedPrefixCommunityTokenStakingRewardsCounter),
            stakePoolAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityStakingRewardsCounterPubkey = communityTokenStakingRewardsCounterDtoInfo[0];
        const communityTokenStakingRewardsCounterAccount = await CONNECTION.getAccountInfo(communityStakingRewardsCounterPubkey);
        if (!communityTokenStakingRewardsCounterAccount) {
            throw Error('Community token staking reward counter is not exist'); // if isDaoEnabled -> error should NOT happened
        }
        if (!communityTokenStakingRewardsAccount) {
            // create CommunityTokenStakingRewards
            instructions.push(StakePoolProgram.createCommunityTokenStakingRewards({
                stakePoolPubkey: stakePoolAddress,
                ownerWallet: tokenOwner,
                communityTokenStakingRewardsDTO: communityTokenStakingRewardsPubkey,
                communityTokenStakingRewardsCounterDTO: communityStakingRewardsCounterPubkey,
            }));
        }
        instructions.push(Token.createApproveInstruction(TOKEN_PROGRAM_ID, poolTokenAccount, userTransferAuthority.publicKey, tokenOwner, [], poolAmount));
        const poolWithdrawAuthority = await findWithdrawAuthorityProgramAddress(StakePoolProgram.programId, stakePoolAddress);
        if (solWithdrawAuthority) {
            const expectedSolWithdrawAuthority = stakePool.account.data.solWithdrawAuthority;
            if (!expectedSolWithdrawAuthority) {
                throw new Error('SOL withdraw authority specified in arguments but stake pool has none');
            }
            if (solWithdrawAuthority.toBase58() !== expectedSolWithdrawAuthority.toBase58()) {
                throw new Error(`Invalid deposit withdraw specified, expected ${expectedSolWithdrawAuthority.toBase58()}, received ${solWithdrawAuthority.toBase58()}`);
            }
        }
        const withdrawTransaction = StakePoolProgram.withdrawSolWithDaoInstruction({
            daoCommunityTokenReceiverAccount,
            communityTokenStakingRewards: communityTokenStakingRewardsPubkey,
            ownerWallet: tokenOwner,
            communityTokenPubkey,
            stakePoolPubkey: stakePoolAddress,
            solWithdrawAuthority,
            stakePoolWithdrawAuthority: poolWithdrawAuthority,
            userTransferAuthority: userTransferAuthority.publicKey,
            poolTokensFrom: poolTokenAccount,
            reserveStakeAccount: stakePool.account.data.reserveStake,
            managerFeeAccount: stakePool.account.data.managerFeeAccount,
            poolMint: stakePool.account.data.poolMint,
            lamportsTo: solReceiver,
            poolTokens: poolAmount,
        });
        instructions.push(withdrawTransaction);
        const transaction = new Transaction();
        instructions.forEach((instruction) => transaction.add(instruction));
        transaction.feePayer = solReceiver;
        transaction.recentBlockhash = (await CONNECTION.getRecentBlockhash()).blockhash;
        transaction.sign(...signers);
        return transaction;
    }
    async withdrawSol(userAddress, lamports, stakeReceiver, poolTokenAccount) {
        var _a, _b;
        const CONNECTION = this.config.connection;
        const stakePoolAddress = this.config.eSOLStakePoolAddress;
        const stakePool = await getStakePoolAccount(CONNECTION, stakePoolAddress);
        const poolAmount = solToLamports(lamports);
        // dao part
        const daoStateDtoInfo = await PublicKey.findProgramAddress([Buffer.from(this.config.seedPrefixDaoState), stakePoolAddress.toBuffer(), StakePoolProgram.programId.toBuffer()], StakePoolProgram.programId);
        const daoStateDtoPubkey = daoStateDtoInfo[0];
        const daoStateDtoInfoAccount = await CONNECTION.getAccountInfo(daoStateDtoPubkey);
        if (!daoStateDtoInfoAccount) {
            throw Error("Didn't find dao state account");
        }
        const daoState = DAO_STATE_LAYOUT.decode(daoStateDtoInfoAccount.data);
        const isDaoEnabled = daoState.isEnabled;
        if (!isDaoEnabled) {
            throw Error('Dao is not enable'); // it should never happened!!!
        }
        if (!poolTokenAccount) {
            poolTokenAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, stakePool.account.data.poolMint, userAddress);
        }
        const tokenAccount = await getTokenAccount(CONNECTION, poolTokenAccount, stakePool.account.data.poolMint);
        if (!tokenAccount) {
            throw new Error('Invalid token account');
        }
        // Check withdrawFrom balance
        if (tokenAccount.amount.toNumber() < poolAmount) {
            throw new Error(`Not enough token balance to withdraw ${lamportsToSol(poolAmount)} pool tokens.
        Maximum withdraw amount is ${lamportsToSol(tokenAccount.amount.toNumber())} pool tokens.`);
        }
        const withdrawAuthority = await findWithdrawAuthorityProgramAddress(StakePoolProgram.programId, stakePoolAddress);
        // Construct transaction to withdraw from withdrawAccounts account list
        const instructions = [];
        const userTransferAuthority = Keypair.generate();
        const signers = [userTransferAuthority];
        // dao
        const communityTokenStakingRewardsInfo = await PublicKey.findProgramAddress([
            Buffer.from(this.config.seedPrefixCommunityTokenStakingRewards),
            stakePoolAddress.toBuffer(),
            userAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityTokenStakingRewardsPubkey = communityTokenStakingRewardsInfo[0];
        const communityTokenStakingRewardsAccount = await CONNECTION.getAccountInfo(communityTokenStakingRewardsPubkey);
        // WE SHOULD CHECK NEXT PART IF USER WITHDRAW !!NOT!! ALL ESOL
        // We can be sure that this account already exists, as it is created when you deposit.
        // But there are some number of users who made a deposit before updating the code with DAO strategy,
        // so here we create an account especially for them.
        // {
        const communityTokenDtoInfo = await PublicKey.findProgramAddress([
            Buffer.from(this.config.seedPrefixCommunityToken),
            stakePoolAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityTokenPubkey = communityTokenDtoInfo[0];
        const communityTokenAccount = await CONNECTION.getAccountInfo(communityTokenPubkey);
        if (!communityTokenAccount) {
            throw Error('Community token is not exist'); // if isDaoEnabled -> error should NOT happened
        }
        const communityTokenInfo = COMMUNITY_TOKEN_LAYOUT.decode(communityTokenAccount.data);
        // check associatedTokenAccount for RENT 165 BYTES FOR RENTs
        const daoCommunityTokenReceiverAccount = await addAssociatedTokenAccount(CONNECTION, userAddress, communityTokenInfo.tokenMint, instructions);
        // }
        // communityTokenStakingRewardsCounter
        const communityTokenStakingRewardsCounterDtoInfo = await PublicKey.findProgramAddress([
            Buffer.from(this.config.seedPrefixCommunityTokenStakingRewardsCounter),
            stakePoolAddress.toBuffer(),
            StakePoolProgram.programId.toBuffer(),
        ], StakePoolProgram.programId);
        const communityStakingRewardsCounterPubkey = communityTokenStakingRewardsCounterDtoInfo[0];
        const communityTokenStakingRewardsCounterAccount = await CONNECTION.getAccountInfo(communityStakingRewardsCounterPubkey);
        if (!communityTokenStakingRewardsCounterAccount) {
            throw Error('Community token staking reward counter is not exist'); // if isDaoEnabled -> error should NOT happened
        }
        if (!communityTokenStakingRewardsAccount) {
            // create CommunityTokenStakingRewards
            instructions.push(StakePoolProgram.createCommunityTokenStakingRewards({
                stakePoolPubkey: stakePoolAddress,
                ownerWallet: userAddress,
                communityTokenStakingRewardsDTO: communityTokenStakingRewardsPubkey,
                communityTokenStakingRewardsCounterDTO: communityStakingRewardsCounterPubkey,
            }));
        }
        instructions.push(Token.createApproveInstruction(TOKEN_PROGRAM_ID, poolTokenAccount, userTransferAuthority.publicKey, userAddress, [], poolAmount));
        const withdrawAccount = await prepareWithdrawAccounts(CONNECTION, stakePool.account.data, stakePoolAddress, poolAmount);
        if (!withdrawAccount) {
            throw Error(`Not available at the moment. Please try again later. Sorry for the inconvenience.`);
        }
        const availableSol = lamportsToSol(withdrawAccount.poolAmount);
        if (withdrawAccount.poolAmount < poolAmount) {
            throw Error(`Currently, you can undelegate only ${availableSol} SOL within one transaction due to delayed unstake limitations. Please unstake the desired amount in few transactions. Note that you will be able to track your unstaked SOL in the “Wallet” tab as a summary of transactions!.`);
        }
        const solWithdrawAmount = Math.ceil(calcLamportsWithdrawAmount(stakePool.account.data, withdrawAccount.poolAmount));
        let infoMsg = `Withdrawing ◎${solWithdrawAmount},
    from stake account ${(_a = withdrawAccount.stakeAddress) === null || _a === void 0 ? void 0 : _a.toBase58()}`;
        if (withdrawAccount.voteAddress) {
            infoMsg = `${infoMsg}, delegated to ${(_b = withdrawAccount.voteAddress) === null || _b === void 0 ? void 0 : _b.toBase58()}`;
        }
        let stakeToReceive;
        let numberOfStakeAccounts = 1;
        let totalRentFreeBalances = 0;
        function incrementStakeAccount() {
            numberOfStakeAccounts++;
        }
        const stakeReceiverAccountBalance = await CONNECTION.getMinimumBalanceForRentExemption(StakeProgram.space);
        const stakeAccountPubkey = await newStakeAccount(CONNECTION, userAddress, instructions, stakeReceiverAccountBalance, numberOfStakeAccounts, incrementStakeAccount);
        totalRentFreeBalances += stakeReceiverAccountBalance;
        stakeToReceive = stakeAccountPubkey;
        stakeReceiver = stakeAccountPubkey;
        instructions.push(StakePoolProgram.withdrawStakeWithDao({
            daoCommunityTokenReceiverAccount,
            communityTokenStakingRewards: communityTokenStakingRewardsPubkey,
            ownerWallet: userAddress,
            communityTokenPubkey,
            stakePool: stakePoolAddress,
            validatorList: stakePool.account.data.validatorList,
            validatorStake: withdrawAccount.stakeAddress,
            destinationStake: stakeToReceive,
            destinationStakeAuthority: userAddress,
            sourceTransferAuthority: userTransferAuthority.publicKey,
            sourcePoolAccount: poolTokenAccount,
            managerFeeAccount: stakePool.account.data.managerFeeAccount,
            poolMint: stakePool.account.data.poolMint,
            poolTokens: withdrawAccount.poolAmount,
            withdrawAuthority,
        }));
        const deactivateTransaction = StakeProgram.deactivate({
            stakePubkey: stakeToReceive,
            authorizedPubkey: userAddress,
        });
        instructions.push(...deactivateTransaction.instructions);
        const transaction = new Transaction();
        instructions.forEach((instruction) => transaction.add(instruction));
        transaction.feePayer = userAddress;
        transaction.recentBlockhash = (await CONNECTION.getRecentBlockhash()).blockhash;
        transaction.sign(...signers);
        return transaction;
    }
}

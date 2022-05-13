import { PublicKey } from '@solana/web3.js';
export declare type ClusterType = 'mainnet-beta' | 'testnet';
export declare class ESolConfig {
    eSOLProgramId: PublicKey;
    eSOLStakePoolAddress: PublicKey;
    seedPrefixDaoState: string;
    seedPrefixCommunityToken: string;
    seedPrefixCommunityTokenStakingRewards: string;
    seedPrefixCommunityTokenStakingRewardsCounter: string;
    connection: any;
    publicKey: PublicKey | null;
    constructor(clusterType: ClusterType);
}

import { PublicKey, Connection } from '@solana/web3.js';
export declare class ESolConfig {
  eSOLProgramId: PublicKey;
  eSOLStakePoolAddress: PublicKey;
  seedPrefixDaoState: string;
  seedPrefixCommunityToken: string;
  seedPrefixCommunityTokenStakingRewards: string;
  seedPrefixCommunityTokenStakingRewardsCounter: string;
  connection: Connection;
  publicKey: PublicKey | null;
  constructor(configOverrides?: Partial<ESolConfig>);
}

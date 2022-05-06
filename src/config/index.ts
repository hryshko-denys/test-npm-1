import { PublicKey, Connection } from '@solana/web3.js';

const DEFAULT_PROVIDER_URL = 'https://api.testnet.solana.com';

export type ClusterType = "mainnet-beta" | "testnet";

const TESTNET_STAKEPOOL_ACCOUNT = "4QRsVADHap1AgtpryYB2vz4htG3ysJcaXFkcFqkGjaF1"
const MAINNET_STAKEPOOL_ACCOUNT = "GUAMR8ciiaijraJeLDEDrFVaueLm9YzWWY9R7CBPL9rA"

const TESTNET_STAKEPOOL_PROGRAM_ID = "CgymamZFh5aVZhoSRtV2QrEZ58X4N1o2H5ZQPF4L5jj8"
const MAINNET_STAKEPOOL_PROGRAM_ID = "EverSFw9uN5t1V8kS3ficHUcKffSjwpGzUSGd7mgmSks"

export class ESolConfig {
  eSOLProgramId: PublicKey;
  eSOLStakePoolAddress: PublicKey
  seedPrefixDaoState = 'dao_state';
  seedPrefixCommunityToken = 'community_token';
  seedPrefixCommunityTokenStakingRewards = 'c_t_staking_rewards';
  seedPrefixCommunityTokenStakingRewardsCounter = 'c_t_staking_rewards_counter';

  connection = new Connection(DEFAULT_PROVIDER_URL);
  publicKey: PublicKey | null = null;

  constructor(clusterType: ClusterType) {
    switch (clusterType) {
      case "testnet":
        this.eSOLStakePoolAddress = new PublicKey(TESTNET_STAKEPOOL_ACCOUNT);
        this.eSOLProgramId = new PublicKey(TESTNET_STAKEPOOL_PROGRAM_ID);
        break;
      case "mainnet-beta":
        this.eSOLStakePoolAddress = new PublicKey(MAINNET_STAKEPOOL_ACCOUNT);
        this.eSOLProgramId = new PublicKey(MAINNET_STAKEPOOL_PROGRAM_ID);
        break;
      default:
        throw new Error("clusterType must be specified");
    }
  }
}

import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { StakePoolProgram } from '../service/stakepool-program';

const TESTNET_PROVIDER_URL = 'https://api.testnet.solana.com';
const MAINNET_PROVIDER_URL = 'https://api.mainnet-beta.solana.com';

export type ClusterType = 'mainnet-beta' | 'testnet';

const TESTNET_STAKEPOOL_ACCOUNT = '4QRsVADHap1AgtpryYB2vz4htG3ysJcaXFkcFqkGjaF1';
const MAINNET_STAKEPOOL_ACCOUNT = 'GUAMR8ciiaijraJeLDEDrFVaueLm9YzWWY9R7CBPL9rA';

const TESTNET_STAKEPOOL_PROGRAM_ID = 'CgymamZFh5aVZhoSRtV2QrEZ58X4N1o2H5ZQPF4L5jj8';
const MAINNET_STAKEPOOL_PROGRAM_ID = 'EverSFw9uN5t1V8kS3ficHUcKffSjwpGzUSGd7mgmSks';

export class ESolConfig {
  eSOLProgramId: PublicKey;
  eSOLStakePoolAddress: PublicKey;
  seedPrefixDaoState = 'dao_state';
  seedPrefixCommunityToken = 'community_token';
  seedPrefixCommunityTokenStakingRewards = 'c_t_staking_rewards';
  seedPrefixCommunityTokenStakingRewardsCounter = 'c_t_staking_rewards_counter';

  connection: any;
  publicKey: PublicKey | null = null;

  constructor(clusterType: ClusterType) {
    console.log(clusterType, "clusterType")
    const API_ENDPOINT = clusterApiUrl(clusterType);
    this.connection = new Connection(API_ENDPOINT);
    
    switch (clusterType) {
      case 'testnet':
        this.eSOLStakePoolAddress = new PublicKey(TESTNET_STAKEPOOL_ACCOUNT);
        this.eSOLProgramId = new PublicKey(TESTNET_STAKEPOOL_PROGRAM_ID);
        break;
      case 'mainnet-beta':
        this.eSOLStakePoolAddress = new PublicKey(MAINNET_STAKEPOOL_ACCOUNT);
        this.eSOLProgramId = new PublicKey(MAINNET_STAKEPOOL_PROGRAM_ID);

        StakePoolProgram.changeProgramId('EverSFw9uN5t1V8kS3ficHUcKffSjwpGzUSGd7mgmSks');
        break;
      default:
        throw new Error('clusterType must be specified');
    }
  }
}

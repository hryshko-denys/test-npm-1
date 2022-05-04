import { PublicKey, Connection } from '@solana/web3.js';
const DEFAULT_PROVIDER_URL = 'https://api.testnet.solana.com';
export class ESolConfig {
    constructor(configOverrides = {}) {
        this.eSOLProgramId = new PublicKey('CgymamZFh5aVZhoSRtV2QrEZ58X4N1o2H5ZQPF4L5jj8');
        this.eSOLStakePoolAddress = new PublicKey('4QRsVADHap1AgtpryYB2vz4htG3ysJcaXFkcFqkGjaF1');
        this.seedPrefixDaoState = 'dao_state';
        this.seedPrefixCommunityToken = 'community_token';
        this.seedPrefixCommunityTokenStakingRewards = 'c_t_staking_rewards';
        this.seedPrefixCommunityTokenStakingRewardsCounter = 'c_t_staking_rewards_counter';
        this.connection = new Connection(DEFAULT_PROVIDER_URL);
        this.publicKey = null;
        Object.assign(this, configOverrides);
    }
}

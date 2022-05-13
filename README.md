<div align="center">
<a href="https://eversol.one/">

![Esol logo](src/logo/esol.svg?raw=true 'Eversol')

</a>
</div>

# Eversol Stake Pool SDK

Eversol is a liquid staking protocol built on Solana. Eversol's main concept is to dedicate a percentage of the pool rewards (currently, 7% in the proposed scheme of Fees and Rewards Distribution) to the Stake Pool's Treasury, to fund the best projects being built on Solana. Unlike other stake pools, we will directly facilitate and boost the DeFi ecosystem by helping new apps and products come to life!

## Installation

```bash
$ npm install @eversol/eversol-ts-sdk
```

### Initialize the library

Import the main client class ESol and initialize it with the desired cluster type:

```ts
import { ESol } from '@eversol/eversol-ts-sdk';

// initializes for mainnet-beta
const eSol = new ESol('mainnet-beta');

// or for testnet
const eSol = new ESol(); // or give 'testnet' as the argument
```

### Deposit SOL Transaction

Stake SOL and get your eSOL:

```ts
...
const depositSolTransaction = await eSol.depositSolTransaction(userAddress, amountLamports)
// than sign and send the `transaction`
```

### Instant unstake eSOL Transaction

Skip the basic Solana cool-down period and undelegate stake instantly. If the feature is not available (meaning there is not enough liquidity/reserve in the pool to cover instant unstaking), please use the standard Unstake:

```ts
...
const instantUnstakeTransaction = await eSol.unDelegateSolTransaction(userAddress, amountLamports)
// than sign and send the `transaction`
```

### Classic delayed unstake eSOL Transaction

Skip the basic Solana cool-down period and undelegate stake instantly. If the feature is not available (meaning there is not enough liquidity/reserve in the pool to cover instant unstaking), please use the standard Unstake:

```ts
...
const instantUnstakeTransaction = await eSol.unDelegateSolTransaction(userAddress, amountLamports)
// than sign and send the `transaction`
```

## Learn more
- [Eversol web](https://eversol.one/)
- [Eversol docs](https://docs.eversol.one/overview/welcome-to-eversol)
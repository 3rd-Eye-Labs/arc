
## Installation
##### NPM
`$ npm install @third-eye-labs/arc`

##### PNPM
`$ pnpm install @third-eye-labs/arc`

##### Yarn
`$ yarn add @third-eye-labs/arc`

## Using

##### Arc Instance
Arc supports using CIP-30 wallets, and wallets by seed phrase. Each have their own required config, however here is how you can load a wallet by seed phrase :
```
const arc = await LoadArc({
    // Custom Iris instance, ignore if using default
    irisHost: 'http://localhost:8000',
    wallet: {
     	// Can use Blockfrost, or Kupo + Ogmios
        connection: {
            url: 'https://cardano-mainnet.blockfrost.io';
            projectId: 'project_id';
        },
        seedPhrase: ['word1', 'word2', ...],
    },
});
```

## Tests
`$ pnpm run test`
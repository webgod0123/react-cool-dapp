import { Bech32Address } from '@keplr-wallet/cosmos'
import { ChainInfoWithExplorer } from './api/cosmosStores/chain'
import { makeIBCMinimalDenom } from './utils/ibc'

// const ibcDenom = 'IBC/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9'.toLowerCase(); // mainnet

interface Chains {
  [key: string]: string
}

export const Chains: Chains = {
  UMEE: 'asherah-2',
  ATOM: 'theta-testnet-001',
  JUNO: 'uni-3',
  OSMO: 'osmo-test-4',
}

/**
 * Determine the channel info per the chain.
 * Guide users to use the same channel for convenience.
 */
export const IBCAssetInfos: {
  counterpartyChainId: string
  // Souce channel id based on the Umee chain
  sourceChannelId: string
  // Destination channel id from Umee chain
  destChannelId: string
  counterpartyCoinMinimalDenom: string
  coinMinimalDenom: string
}[] = [
  {
    counterpartyChainId: 'theta-testnet-001',
    sourceChannelId: 'channel-540',
    destChannelId: 'channel-2',
    counterpartyCoinMinimalDenom: 'uatom',
    coinMinimalDenom: 'ibc/9117A26BA81E29FA4F78F57DC2BD90CD3D26848101BA880445F119B22A1E254E',
  },
  {
    counterpartyChainId: 'uni-3',
    sourceChannelId: 'channel-126',
    destChannelId: 'channel-0',
    counterpartyCoinMinimalDenom: 'ujuno',
    coinMinimalDenom: 'ibc/F20A042D146B6174E2BF9B58D30A10678C9D38AF4F2E10163B10834D47D89FD3',
  },
  {
    counterpartyChainId: 'osmo-test-4',
    sourceChannelId: 'channel-379',
    destChannelId: 'channel-3',
    counterpartyCoinMinimalDenom: 'uosmo',
    coinMinimalDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
  },
]

export const EmbedChainInfos: ChainInfoWithExplorer[] = [
  {
    rpc: 'https://rpc.porthos.asherah-2.network.umee.cc/',
    rest: 'https://api.porthos.asherah-2.network.umee.cc/',
    chainId: 'asherah-2',
    chainName: 'UMEE ASHERAH',
    stakeCurrency: {
      coinDenom: 'UMEE',
      coinMinimalDenom: 'uumee',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('umee'),
    currencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
        coinGeckoId: 'umee',
      },
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'ibc/9117A26BA81E29FA4F78F57DC2BD90CD3D26848101BA880445F119B22A1E254E',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ibc/F20A042D146B6174E2BF9B58D30A10678C9D38AF4F2E10163B10834D47D89FD3',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
      },
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
      },
    ],
    coinType: 118,
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
    explorerUrlToTx: 'https://explorer.umeemania-1.network.umee.cc/umee/tx/{txHash}',
    explorerUrlToAccount: 'https://explorer.umeemania-1.network.umee.cc/umee/account',
  },
  {
    rpc: 'https://rpc.starwoman.cosmos-theta-testnet-001.network.umee.cc/',
    rest: 'https://api.starwoman.cosmos-theta-testnet-001.network.umee.cc/',
    chainId: 'theta-testnet-001',
    chainName: 'ATOM ASHERAH',
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    coinType: 118,
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
    explorerUrlToTx: 'https://explorer.umeemania-1.network.umee.cc/cosmos/tx/{txHash}',
    explorerUrlToAccount: 'https://explorer.umeemania-1.network.umee.cc/cosmos/account',
  },
  {
    rpc: 'https://rpc.peewee.osmo-test-4.network.umee.cc',
    rest: 'https://api.peewee.osmo-test-4.network.umee.cc',
    chainId: 'osmo-test-4',
    chainName: 'OSMO ASHERAH',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
    ],
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
    explorerUrlToTx: 'https://explorer.umeemania-1.network.umee.cc/osmosis/tx/{txHash}',
    explorerUrlToAccount: 'https://explorer.umeemania-1.network.umee.cc/osmosis/account',
  },
  {
    rpc: 'https://rpc.surrogate.juno-uni-3.network.umee.cc',
    rest: 'https://api.surrogate.juno-uni-3.network.umee.cc',
    chainId: 'uni-3',
    chainName: 'JUNO ASHERAH',
    stakeCurrency: {
      coinDenom: 'JUNO',
      coinMinimalDenom: 'ujuno',
      coinDecimals: 6,
      coinGeckoId: 'juno-network',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('juno'),
    currencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
      },
    ],
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
    explorerUrlToTx: 'https://explorer.umeemania-1.network.umee.cc/juno/tx/{txHash}',
    explorerUrlToAccount: 'https://explorer.umeemania-1.network.umee.cc/juno/account',
  },
  {
    rpc: 'https://rpc.aphrodite.main.network.umee.cc',
    rest: 'https://api.aphrodite.main.network.umee.cc',
    chainId: 'umee-1',
    chainName: 'Umee',
    stakeCurrency: {
      coinDenom: 'UMEE',
      coinMinimalDenom: 'uumee',
      coinDecimals: 6,
    },
    bip44: { coinType: 118 },
    bech32Config: Bech32Address.defaultBech32Config('umee'),
    currencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
      },
    ],
    coinType: 118,
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx', 'ibc-go'],
    explorerUrlToTx: 'https://www.mintscan.io/umee/txs/{txHash}',
    explorerUrlToAccount: '',
  },
]

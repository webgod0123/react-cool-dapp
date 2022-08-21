import React, { createContext } from 'react'
import { useStore } from 'api/cosmosStores'
import { BigNumber } from 'ethers'
import { observer } from 'mobx-react-lite'
import { useConvexityAccountData, useConvexityAssetData } from './assetData'
import { MarketsOverview } from 'components/Markets/MarketsOverview'

export interface ISummaryData {
  asset: string,
  base_denom: string,
  title: string,
  description: string,
  logo: string,
  price: number,
  available_liquidity_tokens: number,
  available_liquidity_usd: number,
  borrow_apy: number,
  supply_apy: number,
  reserve_size: number,
  reserve_size_usd: number,
  total_borrow: number,
  total_borrow_usd: number,
  reserve_factor: number,
  utilization_rate: number,
  liquidation_threshold: number,
  max_ltv: number,
  uToken_exchange_rate: number,
  liquidation_incentive: number,
  exponent: number
}

export interface UmeeUserInfo {
  borrow_limit: string
  loaned_value: string
  borrowed_value: string
  collateral_value: string
}

export interface UserData {
  borrowed: Array<any>
  loaned: Array<any>
  collateral_setting: boolean
  collateral: Array<any>
}

export interface ConvexityToken {
  name: string
  address: string
  title: string
  description: string
  logo: string
  marketSizeUsd: string
  marketSize: BigNumber
  depositAPY: string
  variableBorrowAPR: string
  loaned: BigNumber
  borrowed: BigNumber
  availableLiquidity: BigNumber
  decimals: BigNumber
  usageAsCollateralEnabled: boolean
  usageAsCollateral: boolean
  liquidationThreshold: BigNumber
  ltv: BigNumber
  liquidationBonus: BigNumber
  collateral: BigNumber
  usdPrice: string
  chainName?: string
  totalBorrowedUsd: string
  totalBorrowed: string
}

export interface ConvexityAccountData {
  totalLoaned: string
  totalBorrowed: string
  borrowLimit: string
  totalCollateral: string
}

export interface Amount {
  denom: string
  amount: string
  percent?: number
}

export interface Data {
  RegisteredTokens: ConvexityToken[]
  ConvexityPriceData: Amount[] | undefined
  ConvexityAccountData: ConvexityAccountData | undefined
  getConvexityData: () => void
  MarketsSummary: MarketsOverview[]
}

export const ConvexityContext = createContext<Data | null>(null)

export default observer(({ children }) => {
  const { accountStore, chainStore } = useStore()
  const accountAddress = accountStore.getAccount(chainStore.current.chainId).bech32Address

  const { convexityData, getConvexityData, convexityPriceData, marketsOverview, getChain } = useConvexityAssetData(accountAddress)
  const { convexityAccountData, getConvexityAccountData } = useConvexityAccountData(accountAddress)

  const data: Data = {
    RegisteredTokens: convexityData,
    ConvexityPriceData: convexityPriceData.length ? convexityPriceData : undefined,
    ConvexityAccountData: convexityAccountData,
    MarketsSummary: marketsOverview,
    getConvexityData: () => {
      getConvexityAccountData()
      getConvexityData()
    },
  }

  return <ConvexityContext.Provider value={data}>{children}</ConvexityContext.Provider>
})

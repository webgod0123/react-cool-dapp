import { useState, useMemo, useEffect, useCallback } from 'react'
import { BigNumber, EventFilter } from 'ethers'
import { UmeeProtocolDataProvider, LendingPool } from '../types'
import { IReserveData, IUserReserveData, IReserveConfigurationData, IAssetPrices } from 'lib/types'
import { parseUnits } from 'ethers/lib/utils'

const API_URL = process.env.API_ENDPOINT || 'http://127.0.0.1:3001'

interface IUserAccount {
  totalCollateralETH: BigNumber
  totalDebtETH: BigNumber
  availableBorrowsETH: BigNumber
  currentLiquidationThreshold: BigNumber
  ltv: BigNumber
  healthFactor: BigNumber
}

const APY_DECIMALS = 25
const MAX_PERCENTAGE = 10000

const useReserveData = (
  umeeProtocolDataProvider?: UmeeProtocolDataProvider,
  lendingPool?: LendingPool,
  user?: string
) => {
  const [allReserveTokens, setAllReserveTokens] = useState<{ symbol: string; tokenAddress: string }[]>([])
  const [reserveConfigurationData, setReserveConfigurationData] = useState<IReserveConfigurationData[]>([])
  const [reserveData, setReserveData] = useState<IReserveData[]>([])
  const [userAccountData, setUserAccountData] = useState<IUserAccount>()
  const [userReserveData, setUserReserveData] = useState<IUserReserveData[]>([])
  const [priceData, setPriceData] = useState<IAssetPrices>()

  const getUserData = useCallback(() => {
    if (!user) {
      return
    }

    fetch(API_URL + `/reflection/assets/${user}`)
      .then(res => res.json())
      .then(res => {
        setUserAccountData({
          totalCollateralETH: BigNumber.from(res.userAccountData.totalCollateralETH),
          totalDebtETH: BigNumber.from(res.userAccountData.totalDebtETH),
          availableBorrowsETH: BigNumber.from(res.userAccountData.availableBorrowsETH),
          currentLiquidationThreshold: BigNumber.from(res.userAccountData.currentLiquidationThreshold),
          ltv: BigNumber.from(res.userAccountData.ltv),
          healthFactor: BigNumber.from(res.userAccountData.healthFactor)
        })
        setUserReserveData(res.userReserveData.map(
          (item: any) => ({
            symbol: item.symbol,
            address: item.address,
            decimals: BigNumber.from(item.decimals),
            currentUTokenBalance: BigNumber.from(item.currentUTokenBalance),
            currentStableDebt: BigNumber.from(item.currentStableDebt),
            currentVariableDebt: BigNumber.from(item.currentVariableDebt),
            principalStableDebt: BigNumber.from(item.principalStableDebt),
            scaledVariableDebt: BigNumber.from(item.scaledVariableDebt),
            stableBorrowRate: BigNumber.from(item.stableBorrowRate),
            liquidityRate: BigNumber.from(item.liquidityRate),
            stableRateLastUpdated: item.stableRateLastUpdated,
            usageAsCollateralEnabled: item.usageAsCollateralEnabled,
          })
        ))
      })
  }, [user])

  useEffect(() => {
    fetch(API_URL + '/reflection/assets/all')
      .then(res => res.json())
      .then(res => {
        setPriceData(() => res.reduce((acc: IAssetPrices, asset: any) => ({
          ...acc,
          [asset.symbol]: asset.price
        }), {}))
        setAllReserveTokens(res.map(
          (item: any) => ({ symbol: item.symbol, tokenAddress: item.address }))
        )
        setReserveConfigurationData(res.map(
          (item: any) => ({
            symbol: item.symbol,
            address: item.address,
            decimals: BigNumber.from(item.decimals),
            ltv: BigNumber.from(item.ltv * MAX_PERCENTAGE),
            liquidationThreshold: BigNumber.from(item.liquidationThreshold * MAX_PERCENTAGE),
            liquidationBonus: BigNumber.from(item.liquidationBonus * MAX_PERCENTAGE),
            reserveFactor: BigNumber.from(item.reserveFactor * MAX_PERCENTAGE),
            usageAsCollateralEnabled: item.usageAsCollateralEnabled,
            borrowingEnabled: item.borrowingEnabled,
            stableBorrowRateEnabled: item.stableBorrowRateEnabled,
            isActive: item.isActive,
            isFrozen: item.isFrozen,
          })
        ))
        setReserveData(res.map(
          (item: any) => ({
            symbol: item.symbol,
            address: item.address,
            title: item.title,
            usdPrice: item.price.usd,
            description: item.description,
            availableLiquidity: parseUnits(item.availableLiquidity.toString(), item.decimals),
            totalStableDebt: parseUnits(item.totalStableDebt.toString(), item.decimals),
            totalVariableDebt: parseUnits(item.totalVariableDebt.toString(), item.decimals),
            liquidityRate: parseUnits(item.liquidityRate.toString(), APY_DECIMALS),
            variableBorrowRate: parseUnits(item.variableBorrowRate.toString(), APY_DECIMALS),
            stableBorrowRate: parseUnits(item.stableBorrowRate.toString(), APY_DECIMALS),
            averageStableBorrowRate: parseUnits(item.averageStableBorrowRate.toString(), APY_DECIMALS),
            liquidityIndex: parseUnits(item.liquidityIndex.toString(), APY_DECIMALS),
            variableBorrowIndex: parseUnits(item.variableBorrowIndex.toString(), APY_DECIMALS),
            lastUpdateTimestamp: item.lastUpdateTimestamp,
            logo: item.logo
          })
        ))
      })
  }, [])

  useEffect(() => {
    getUserData()
  }, [getUserData])

  useEffect(() => {
    const updateReserveData = (
      reserve: string,
      liquidityRate: BigNumber,
      stableBorrowRate: BigNumber,
      variableBorrowRate: BigNumber,
      liquidityIndex: BigNumber,
      variableBorrowIndex: BigNumber
    ) => {
      const tokenIndex = reserveData.findIndex(d => d.address === reserve)
      if (tokenIndex >= 0) {
        setReserveData(data => data.map((item, key) => key === tokenIndex ? {
          ...item,
          liquidityRate: liquidityRate,
          stableBorrowRate: stableBorrowRate,
          variableBorrowRate: variableBorrowRate,
          liquidityIndex: liquidityIndex,
          variableBorrowIndex: variableBorrowIndex
        } : item))
      }
    }

    if (!lendingPool) {
      return
    }

    const reserveDataUpdatedFilter = lendingPool.filters.ReserveDataUpdated(null, null, null, null, null, null)
    lendingPool.on(reserveDataUpdatedFilter, updateReserveData)

    return () => {
      lendingPool.removeListener(reserveDataUpdatedFilter, updateReserveData)
    }
  }, [reserveData, lendingPool])

  useEffect(() => {
    if (!lendingPool || !user) {
      return
    }

    const depositFilter = lendingPool.filters.Deposit(null, null, user, null, null)
    lendingPool.on(depositFilter, getUserData)

    const withdrawFilter = lendingPool.filters.Withdraw(null, user, null, null)
    lendingPool.on(withdrawFilter, getUserData)

    const borrowFilter = lendingPool.filters.Borrow(null, null, user, null, null, null, null)
    lendingPool.on(borrowFilter, getUserData)

    const repayFilter = lendingPool.filters.Repay(null, user, null, null)
    lendingPool.on(repayFilter, getUserData)

    return () => {
      lendingPool.removeListener(depositFilter, getUserData)
      lendingPool.removeListener(withdrawFilter, getUserData)
      lendingPool.removeListener(borrowFilter, getUserData)
      lendingPool.removeListener(repayFilter, getUserData)
    }

  }, [lendingPool, user, getUserData])

  // listen event to update reserve configuration data
  useEffect(() => {
    if (!umeeProtocolDataProvider || !lendingPool || !user) {
      return
    }

    interface TypedEventFilter<_EventArgsArray, _EventArgsObject> extends EventFilter {}
    interface FilterListener {
      filter: TypedEventFilter<[], {}>,
      callback: (() => void),
    }
    const filterListeners: FilterListener[] = []

    const enableReserveAsCollateral = (reserve: string, enabled: boolean) => () => {
      setReserveConfigurationData(prev => {
        if (enabled) {
          const index = reserveConfigurationData.find(item => item.address === reserve)
          if (index) {
            return prev.concat(index)
          } else {
            return prev
          }
        } else {
          return prev.filter(item => item.address !== reserve)
        }
      })
    }

    allReserveTokens.forEach(asset => {
      const reserveUseAsCollateralDisabledFilter = lendingPool.filters.ReserveUsedAsCollateralDisabled(asset.tokenAddress, user)
      const reserveUseAsCollateralDisabledListener = enableReserveAsCollateral(asset.tokenAddress, false)
      const reserveUseAsCollateralEnabledFilter = lendingPool.filters.ReserveUsedAsCollateralEnabled(asset.tokenAddress, user)
      const reserveUseAsCollateralEnabledListener = enableReserveAsCollateral(asset.tokenAddress, true)

      lendingPool.on(reserveUseAsCollateralDisabledFilter, reserveUseAsCollateralDisabledListener)
      lendingPool.on(reserveUseAsCollateralEnabledFilter, reserveUseAsCollateralEnabledListener)

      filterListeners.push({ filter: reserveUseAsCollateralDisabledFilter, callback: reserveUseAsCollateralDisabledListener })
      filterListeners.push({ filter: reserveUseAsCollateralEnabledFilter, callback: reserveUseAsCollateralEnabledListener })
    })

    return () => {
      filterListeners.forEach(listener => {
        lendingPool.removeListener(listener.filter, listener.callback)
      })
    }
  }, [umeeProtocolDataProvider, lendingPool, allReserveTokens, reserveConfigurationData, user])

  // const filter = (item: any) => ['ATOM', 'DAI'].includes(item.symbol)

  return {
    allReserveTokens,
    reserveConfigurationData: reserveConfigurationData,
    reserveData: reserveData,
    userReserveData: userReserveData,
    userAccountData,
    priceData
  }
}

export default useReserveData

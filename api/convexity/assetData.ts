import { useStore } from 'api/cosmosStores'
import { Chains } from '../../config'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ConvexityAccountData, ConvexityToken, UmeeUserInfo, Amount, ISummaryData } from './data'
import abbreviateNumber from 'lib/abbreviate'
import { MarketsOverview } from 'components/Markets/MarketsOverview'

const API_URL = process.env.API_ENDPOINT || 'http://127.0.0.1:3001'

export const useConvexityAssetData = (address: string) => {
  const [convexityData, setConvexityData] = useState<ConvexityToken[]>([])
  const { chainStore } = useStore()

  const getChainName = useCallback(
    (symbol: string) => {
      const chainId = Chains[symbol]
      return chainStore.getChain(chainId).chainName
    },
    [chainStore],
  )

  const getConvexityData = useCallback(
    async (address: string) => {
      let assets: ConvexityToken[] = []
      const fetchMarketSummary = await fetch(API_URL + '/convexity/assets/all')
      const marketSummaryData: ISummaryData[] = await fetchMarketSummary.json()

      for (let i = 0; i < marketSummaryData.length; i++) {
        const token = marketSummaryData[i]
        const symbol = token.asset.toUpperCase()
        const data = {
          name: symbol,
          address: token.base_denom,
          title: token.title,
          description: token.description,
          logo: token.logo,
          marketSizeUsd: token.reserve_size_usd.toString(),
          marketSize: BigNumber.from(token.reserve_size * Math.pow(10, 6)),
          depositAPY: token.supply_apy.toFixed(2),
          variableBorrowAPR: token.borrow_apy.toFixed(2),
          loaned: BigNumber.from(0),
          borrowed: BigNumber.from(0),
          availableLiquidity: BigNumber.from(token.available_liquidity_tokens * Math.pow(10, 6)),
          decimals: BigNumber.from(token.exponent),
          usageAsCollateral: false,
          usageAsCollateralEnabled: token.max_ltv > 0 ? true : false,
          liquidationThreshold: BigNumber.from(token.liquidation_threshold * Math.pow(10, 4)),
          ltv: BigNumber.from(token.max_ltv * Math.pow(10, 4)),
          liquidationBonus: BigNumber.from(token.liquidation_incentive * Math.pow(10, 4)),
          collateral: BigNumber.from(0),
          usdPrice: token.price.toString(),
          chainName: getChainName(symbol),
          totalBorrowedUsd: token.total_borrow_usd.toString(),
          totalBorrowed: token.total_borrow.toFixed(2),
        }

        if (address) {
          const userDataFetch = await fetch(API_URL + `/user/?address=${address}&denom=${token.base_denom}`)
          const userData = await userDataFetch.json()
          const loanedValue = userData.loaned
          const borrowedValue = userData.borrowed
          const collateralAmount = userData.collateral
          data.loaned = loanedValue.length > 0 ? BigNumber.from(loanedValue[0]['amount']) : BigNumber.from(0)
          data.borrowed = borrowedValue.length > 0 ? BigNumber.from(borrowedValue[0]['amount']) : BigNumber.from(0)
          data.collateral =
            collateralAmount.length > 0 ? BigNumber.from(collateralAmount[0]['amount']) : BigNumber.from(0)
          if(userData.collateral_setting) data.usageAsCollateral = true
        }
        assets.push(data)
      }

      const orderedList = assets.sort((asset1, asset2) => Number(asset2.marketSizeUsd) - Number(asset1.marketSizeUsd))
      setConvexityData(orderedList)
    },
    [getChainName],
  )

  const convexityPriceData = useMemo(
    () =>
      convexityData.map((data) => ({
        denom: data.name,
        amount: data.usdPrice,
      })),
    [convexityData],
  )

  const totalSupplied = useMemo(() => {
    let totalSupplied = convexityData.reduce((sum, asset) => {
      sum += Number(asset.marketSizeUsd)
      return sum
    }, 0)

    return totalSupplied
  }, [convexityData])

  const percentValue = (total: number, value: number) => {
    let percent = 0
    if (total > 0) {
      percent = (value / total) * 100
    }

    return percent
  }

  const totalBorrowed = useMemo(() => {
    const totalBorrowed = convexityData.reduce((sum, asset) => {
      sum += Number(asset.totalBorrowedUsd)
      return sum
    }, 0)

    return totalBorrowed
  }, [convexityData])

  const topSupplied = useMemo(() => {
    const topSupplied = convexityData.slice(0, 3).map((asset) => {
      const data: Amount = {
        denom: asset.name,
        amount: abbreviateNumber(Number(asset.marketSizeUsd).toFixed(2)),
        percent: percentValue(totalSupplied, Number(asset.marketSizeUsd)),
      }

      return data
    })
    return topSupplied
  }, [convexityData, totalSupplied])

  const topBorrowed = useMemo(() => {
    let data = convexityData
    data = data.sort((asset1, asset2) => {
      return Number(asset2.totalBorrowedUsd) - Number(asset1.totalBorrowedUsd)
    })

    const topBorrowed = data.slice(0, 3).map((asset) => {
      const data: Amount = {
        denom: asset.name,
        amount: abbreviateNumber(Number(asset.totalBorrowedUsd).toFixed(2)),
        percent: percentValue(totalBorrowed, Number(asset.totalBorrowedUsd)),
      }

      return data
    })
    return topBorrowed
  }, [convexityData, totalBorrowed])

  const marketsOverview = useMemo(() => {
    const marketsOverview: MarketsOverview[] = [
      {
        title: 'Total Supplied',
        value: Number(totalSupplied).toFixed(2),
        children: topSupplied,
        color: 'clrSupply',
      },
      {
        title: 'Total Borrowed',
        value: Number(totalBorrowed).toFixed(2),
        children: topBorrowed,
        color: 'clrBorrow',
      },
    ]

    return marketsOverview
  }, [totalSupplied, totalBorrowed, topSupplied, topBorrowed])

  const fetchData = useCallback(() => {
    getConvexityData(address)
  }, [address, getConvexityData])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 60000)
    return () => clearInterval(timer)
  }, [fetchData])

  return {
    convexityData,
    convexityPriceData,
    marketsOverview,
    getConvexityData: () => {
      fetchData()
    },
    getChain: (symbol: string) => {
      getChainName(symbol)
    }
  }
}

export const useConvexityAccountData = (address: string) => {
  const [convexityAccountData, setConvexityAccountData] = useState<ConvexityAccountData>()

  const getAccountData = useCallback((address: string) => {
    if (address) {
      fetch(API_URL + `/umee_stats_user/${address}`)
        .then((res) => res.json())
        .then((result: UmeeUserInfo) => {
          const data = {
            totalLoaned: result.loaned_value || '0',
            totalBorrowed: result.borrowed_value || '0',
            borrowLimit: result.borrow_limit || '0',
            totalCollateral: result.collateral_value || '0',
          }

          setConvexityAccountData(data)
        })
    } else {
      setConvexityAccountData({
        totalLoaned: '0',
        totalBorrowed: '0',
        borrowLimit: '0',
        totalCollateral: '0',
      })
    }
  }, [])

  const getData = useCallback(() => {
    getAccountData(address)
  }, [address, getAccountData])

  useEffect(() => {
    getData()
    const timer = setInterval(getData, 60000)
    return () => clearInterval(timer)
  }, [getData])

  return {
    convexityAccountData,
    getConvexityAccountData: () => {
      getData()
    },
  }
}

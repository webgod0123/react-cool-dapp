import React, { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { MarketsDataList } from 'components'
import { IDataListColumn } from 'components/DataList/DataList'
import { useData } from 'api/data'
import { useState, useEffect } from 'react'
import PageLoading from 'components/common/Loading/PageLoading'
import { bigNumberToUSDString, bigNumberToString } from 'lib/number-utils'
import { useUmeeTokenAddress } from 'api/web3/chains'
import { useWeb3 } from 'api/web3'
import { IMarketsData } from 'components/Markets/MarketsDataList'
import MarketsOverview, { MarketsOverview as MarketsOverviewProps } from 'components/Markets/MarketsOverview'
import { Box } from 'grommet'
import { Amount } from 'api/convexity/data'
import abbreviateNumber from 'lib/abbreviate'
import UmeeLogo from '../../public/images/Logo.svg'

const defaultDecimals = { ATOM: 6, DAI: 18, USDC: 6, USDT: 6, WETH: 18 }

interface ReflectionProps {
  size: string
  chain: string
  marketColumns: IDataListColumn[]
  marketMobileColumns: IDataListColumn[]
}

const aprDecimals = BigNumber.from(25)

const Reflection: React.FC<ReflectionProps> = ({ size, chain, marketColumns, marketMobileColumns }) => {
  const [marketData, setMarketData] = useState<IMarketsData[]>([])
  const { account: etherAddr, chainId } = useWeb3()
  const [totalMarketSizeUsd, setTotalMarketSizeUsd] = useState<number>()
  const [totalBorrowedUsd, setTotalBorrowedUsd] = useState<number>()
  const umeeTokenAddr = useUmeeTokenAddress(chainId)

  const { ReserveData, ReserveConfigurationData, UserReserveData } = useData()

  useEffect(() => {
    let totalMarketSizeUsd = 0
    let totalBorrowedUsd = 0
    let marketsData = ReserveData.reduce((acc, reserveData, index) => {
      const tokenConfig = ReserveConfigurationData.find((rc) => rc.address === reserveData.address)
      let decimals
      if (etherAddr) {
        decimals = tokenConfig?.decimals || BigNumber.from(18)
      } else {
        const symbol = reserveData.symbol
        decimals = BigNumber.from(defaultDecimals[symbol as keyof typeof defaultDecimals])
      }
      const borrowed = reserveData.totalStableDebt.add(reserveData.totalVariableDebt)

      const marketSize = bigNumberToString(reserveData.availableLiquidity.add(borrowed), decimals)
      const borrowedUsd = bigNumberToUSDString(borrowed, decimals, reserveData.usdPrice)
      const marketSizeUsd = bigNumberToUSDString(
        reserveData.availableLiquidity.add(borrowed),
        decimals,
        reserveData.usdPrice,
      )
      const ltv = tokenConfig?.ltv || BigNumber.from(0)

      const depositAPY = bigNumberToString(reserveData.liquidityRate, aprDecimals)
      const variableBorrowAPR = reserveData.variableBorrowRate
      totalMarketSizeUsd += parseFloat(marketSizeUsd)
      totalBorrowedUsd += parseFloat(borrowedUsd)
      setTotalMarketSizeUsd(totalMarketSizeUsd)
      setTotalBorrowedUsd(totalBorrowedUsd)

      acc.push({
        name: reserveData.symbol,
        address: reserveData.address,
        marketSize,
        marketSizeUsd,
        totalBorrowed: bigNumberToString(borrowed, decimals),
        totalBorrowedUsd: borrowedUsd,
        depositAPY,
        variableBorrowAPR,
        ltv,
        logo: reserveData.logo,
        chain: 'Ethereum',
      })

      return acc
    }, [] as IMarketsData[])

    // const umee = {
    //   name: 'UMEE',
    //   address: umeeTokenAddr,
    //   logo: UmeeLogo,
    //   marketSize: '0',
    //   totalBorrowed: '0',
    //   marketSizeUsd: '0.00',
    //   totalBorrowedUsd: '0',
    //   depositAPY: '0',
    //   variableBorrowAPR: BigNumber.from(0),
    //   ltv: BigNumber.from(0),
    // } as IMarketsData

    // marketsData.splice(1, 0, umee)

    marketsData = marketsData.sort((first, second) => {
      return parseFloat(second.marketSizeUsd) - parseFloat(first.marketSizeUsd)
    })

    setMarketData(marketsData)
  }, [ReserveConfigurationData, ReserveData, UserReserveData, umeeTokenAddr, etherAddr])

  const percentValue = (total: number, value: number) => {
    let percent = 0
    if (total > 0) {
      percent = (value / total) * 100
    }

    return percent
  }

  const marketsSummary = useMemo(() => {
    const topSupplied = marketData.slice(0, 3).map((asset) => {
      const data: Amount = {
        denom: asset.name,
        amount: abbreviateNumber(Number(asset.marketSizeUsd).toFixed(2)),
        percent: percentValue(Number(totalMarketSizeUsd), Number(asset.marketSizeUsd)),
      }

      return data
    })

    let data = marketData
    data = data.sort((first, second) => {
      return parseFloat(second.totalBorrowedUsd) - parseFloat(first.totalBorrowedUsd)
    })

    const topBorrowed = data.slice(0, 3).map((asset) => {
      const data: Amount = {
        denom: asset.name,
        amount: abbreviateNumber(Number(asset.totalBorrowedUsd).toFixed(2)),
        percent: percentValue(Number(totalBorrowedUsd), Number(asset.totalBorrowedUsd)),
      }

      return data
    })

    const marketsOverview: MarketsOverviewProps[] = [
      {
        title: 'Total Supplied',
        value: totalMarketSizeUsd ? Number(totalMarketSizeUsd).toFixed(2) : '0',
        children: topSupplied,
        color: 'clrSupply',
      },
      {
        title: 'Total Borrowed',
        value: totalBorrowedUsd ? Number(totalBorrowedUsd).toFixed(2) : '0',
        children: topBorrowed,
        color: 'clrBorrow',
      },
    ]

    return marketsOverview
  }, [marketData, totalBorrowedUsd, totalMarketSizeUsd])

  return (
    <>
      <MarketsOverview overviews={marketsSummary} />
      <Box margin={{ top: 'large' }}>
        <MarketsDataList
          columns={size === 'small' || size === 'medium' ? marketMobileColumns : marketColumns}
          data={marketData.length === 0 ? undefined : marketData}
          chainType={chain}
        />
      </Box>
    </>
  )
}

export default Reflection

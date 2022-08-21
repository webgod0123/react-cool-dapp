import React, { useState, useEffect } from 'react'
import { IUserTxnDeposit, IUserTxnBorrow } from 'lib/types'
import { useData } from 'api/data'
import { useWeb3 } from 'api/web3'
import { BigNumber, utils } from 'ethers'
import { IDataListColumn } from 'components/DataList/DataList'
import { bigNumberETHToString, bigNumberToNumber, bigNumberToString, bigNumberToUSDNumber } from 'lib/number-utils'
import { useUserBalances } from 'api/data/allowanceData'
import { getMaxBorrows } from 'lib/health-utils'
import DashBoardContent from './content'
import { IAvailableBorrowsData } from 'components/Borrows/DataList/AvailableBorrowsDataList'
import { IAvailableDepositsData } from 'components/Deposits/DataList/AvailableDepositsDataList'

export interface DashboardProps {
  depositsColumns: IDataListColumn[]
  borrowsColumns: IDataListColumn[]
  availableMarketsColumns: IDataListColumn[]
}

const aprDecimals = BigNumber.from(25)

const Reflection = ({ depositsColumns, borrowsColumns, availableMarketsColumns }: DashboardProps) => {
  const [availableDepositsData, setAvailableDepositsData] = useState<IAvailableDepositsData[]>([])
  const [availableBorrowsData, setAvailableBorrowsData] = useState<IAvailableBorrowsData[]>([])
  const [borrowData, setBorrowData] = useState<IUserTxnBorrow[]>([])
  const [depositData, setDepositData] = useState<IUserTxnDeposit[]>([])
  const [myDepositsTotal, setMyDepositsTotal] = useState<number>(0)
  const [myBorrowsTotal, setMyBorrowsTotal] = useState<number>(0)
  const [averageAPY, setAverageAPY] = useState<number>(0)
  const [totalCollateral, setTotalCollateral] = useState<string>('0')
  const [borrowLimitUsed, setBorrowLimitUsed] = useState<string>('0')
  const [borrowLimit, setBorrowLimit] = useState<number>(0)
  const { UserAccountData, UserReserveData, ReserveConfigurationData, ReserveData, priceData, Addresses } = useData()
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([])
  const web3 = useWeb3()
  const [ethPrice, setEthPrice] = useState<number>()
  const walletBalances = useUserBalances(tokenAddresses)

  useEffect(() => {
    if (!Addresses.reserve?.length) return
    setTokenAddresses(Addresses.reserve?.length ? Addresses.reserve.map((r) => r.tokenAddress) : [])
  }, [Addresses])

  useEffect(() => {
    if (priceData) {
      setEthPrice(priceData['WETH'].usd)
    }
  }, [priceData])

  useEffect(() => {
    setBorrowData(
      UserReserveData.filter((d) => !d.currentVariableDebt.isZero()).map((reserve) => {
        return {
          symbol: reserve.symbol,
          address: reserve.address,
          decimals: reserve.decimals,
          usdPrice: ReserveData.find((r) => r.address.toLowerCase() === reserve.address.toLowerCase())?.usdPrice || 0,
          currentUTokenBalance: reserve.currentUTokenBalance,
          currentStableDebt: reserve.currentStableDebt,
          currentVariableDebt: reserve.currentVariableDebt,
          principalStableDebt: reserve.principalStableDebt,
          scaledVariableDebt: reserve.scaledVariableDebt,
          stableBorrowRate: reserve.stableBorrowRate,
          liquidityRate: reserve.liquidityRate,
          stableRateLastUpdated: reserve.stableRateLastUpdated,
          usageAsCollateralEnabled: reserve.usageAsCollateralEnabled,
          variableBorrowAPR:
            ReserveData.find((r) => r.address === reserve.address)?.variableBorrowRate || BigNumber.from(0),
          stableBorrowAPR:
            ReserveData.find((r) => r.address === reserve.address)?.stableBorrowRate || BigNumber.from(0),
          chain: 'Ethereum',
          logo: ReserveData.find((r) => r.address === reserve.address)?.logo || '',
        }
      }),
    )

    if (ReserveData && UserReserveData) {
      const tokens = ReserveData.reduce((acc, datum) => {
        const data = UserReserveData.find((value) => value.address === datum.address)
        let availableAmount
        if (UserAccountData && datum.address && priceData && datum.symbol && ReserveData) {
          // Maximum a user can Borrow to keep health in good standing
          const MaxAvailable = getMaxBorrows(
            UserAccountData,
            priceData[datum.symbol].eth,
            datum.symbol,
            ReserveConfigurationData.find((r) => r.address === datum.address)?.decimals.toString() || '18',
          )

          // If the User's deposits is less than healthFactor max => Can withdraw all
          // If deposits are less => can withdraw up to healthFactor max
          if (datum.availableLiquidity.lt(MaxAvailable)) {
            availableAmount = datum.availableLiquidity
          } else {
            availableAmount = MaxAvailable
          }
        }
        if (!data || (data && data.currentVariableDebt?.isZero())) {
          acc.push({
            address: datum.address,
            symbol: datum.symbol,
            color: 'black',
            tokensAvailable: availableAmount,
            usdAvailable: datum.usdPrice,
            variableAPR: bigNumberToString(datum.variableBorrowRate, aprDecimals),
            decimals: ReserveConfigurationData.find((r) => r.address === datum.address)?.decimals.toNumber(),
            borrowingEnabled:
              ReserveConfigurationData.find((r) => r.address === datum.address)?.borrowingEnabled || false,
            chain: 'Ethereum',
            logo: datum.logo,
          })
        }
        return acc
      }, Array<IAvailableBorrowsData>())
      setAvailableBorrowsData(tokens)
    }
  }, [ReserveConfigurationData, ReserveData, UserAccountData, UserReserveData, priceData])

  useEffect(() => {
    if (UserReserveData) {
      setDepositData(
        UserReserveData.filter((d) => d.currentUTokenBalance && !d.currentUTokenBalance.isZero()).map((reserve) => {
          return {
            symbol: reserve.symbol,
            address: reserve.address,
            decimals: reserve.decimals,
            currentUTokenBalance: reserve.currentUTokenBalance,
            currentStableDebt: reserve.currentStableDebt,
            currentVariableDebt: reserve.currentVariableDebt,
            principalStableDebt: reserve.principalStableDebt,
            scaledVariableDebt: reserve.scaledVariableDebt,
            stableBorrowRate: reserve.stableBorrowRate,
            liquidityRate: reserve.liquidityRate,
            stableRateLastUpdated: reserve.stableRateLastUpdated,
            usageAsCollateralEnabled: reserve.usageAsCollateralEnabled,
            usdPrice: ReserveData.find((r) => r.address.toLowerCase() === reserve.address.toLowerCase())?.usdPrice || 0,
            chain: 'Ethereum',
            logo: ReserveData.find((r) => r.address === reserve.address)?.logo || '',
          }
        }),
      )

      let depositReserves = UserReserveData.reduce((acc, userReserve, i) => {
        if (userReserve.currentUTokenBalance?.isZero()) {
          acc.push({
            address: userReserve.address,
            symbol: userReserve.symbol,
            color: 'clrReserveIndicatorDefault',
            tokenBalance: walletBalances[i],
            apy: bigNumberToString(userReserve.liquidityRate, aprDecimals),
            decimals: userReserve.decimals.toNumber(),
            usageAsCollateralEnabled: userReserve.usageAsCollateralEnabled,
            chain: 'Ethereum',
            logo: ReserveData.find((r) => r.address === userReserve.address)?.logo || '',
          })
        }
        return acc
      }, Array<IAvailableDepositsData>())

      setAvailableDepositsData(depositReserves)
    }
  }, [ReserveConfigurationData, ReserveData, UserReserveData, walletBalances])

  useEffect(() => {
    if (!priceData || !UserAccountData) return
    setMyDepositsTotal(
      UserReserveData.reduce((acc, reserve) => {
        const assetPrice = priceData[reserve.symbol].usd
        const tempReserve = parseFloat(utils.formatUnits(reserve.currentUTokenBalance, reserve.decimals))
        acc += tempReserve * assetPrice
        return acc
      }, 0),
    )
    setMyBorrowsTotal(
      UserReserveData.reduce((acc, reserve) => {
        const assetPrice = priceData[reserve.symbol].usd
        acc += bigNumberToUSDNumber(
          reserve.currentVariableDebt.add(reserve.currentStableDebt),
          reserve.decimals,
          assetPrice,
        )
       
        return acc
      }, 0),
    )

    const averageLoanApy = UserReserveData.reduce((acc, reserve) => {
      if (!reserve.currentUTokenBalance.isZero()) {
        const usd = priceData[reserve.symbol].usd
        const apy = bigNumberToNumber(reserve.liquidityRate, 25)
        const loaned = parseFloat(utils.formatUnits(reserve.currentUTokenBalance, reserve.decimals))
        const totalAmountLoaned = loaned * usd
        const netApy = (apy / 100) * totalAmountLoaned
        acc += netApy
      }
      return acc
    }, 0)
    const averageBorrowApy = UserReserveData.reduce((acc, reserve) => {
      if (!reserve.currentVariableDebt.isZero()) {
        const usd = priceData[reserve.symbol].usd
        const apy = bigNumberToNumber(
          ReserveData.find((r) => r.address === reserve.address)?.variableBorrowRate || 0,
          25,
        )
        const borrowed = parseFloat(utils.formatUnits(reserve.currentUTokenBalance, reserve.decimals))
        const totalAmountBorrowed = borrowed * usd
        const netApy = (apy / 100) * totalAmountBorrowed
        acc += netApy
      }
      return acc
    }, 0)
    if (myDepositsTotal > 0) {
      const apy = ((averageLoanApy - averageBorrowApy) / myDepositsTotal) * 100
      if (!isNaN(apy)) setAverageAPY(apy)
    }
    if (ethPrice) setTotalCollateral(bigNumberETHToString(UserAccountData.totalCollateralETH, ethPrice))
  }, [UserReserveData, priceData, UserAccountData, ethPrice, myDepositsTotal, ReserveData])

  useEffect(() => {
    if (UserAccountData && myDepositsTotal && myBorrowsTotal) {
      const maxLtv = UserAccountData.currentLiquidationThreshold.toString()
      const borrowLimit = (myDepositsTotal * parseFloat(maxLtv)) / 10000
      setBorrowLimitUsed(borrowLimit > 0 ? ((myBorrowsTotal / borrowLimit) * 100).toFixed(2) : '0')
      setBorrowLimit(borrowLimit)
    }
  }, [myBorrowsTotal, UserAccountData, myDepositsTotal])

  return (
    <DashBoardContent
      logedIn={!!web3.account}
      accountData={!!UserAccountData}
      myDepositsTotal={myDepositsTotal}
      myBorrowsTotal={myBorrowsTotal}
      totalCollateral={totalCollateral}
      borrowLimit={borrowLimit}
      averageAPY={averageAPY}
      borrowLimitUsed={parseFloat(borrowLimitUsed)}
      depositData={depositData}
      availableDepositsData={availableDepositsData}
      borrowData={borrowData}
      availableBorrowsData={availableBorrowsData}
      depositsColumns={depositsColumns}
      borrowsColumns={borrowsColumns}
      availableMarketsColumns={availableMarketsColumns}
    />
  )
}

export default Reflection

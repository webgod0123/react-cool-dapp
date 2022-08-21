import React, { useEffect, useMemo, useState } from 'react'
import { useConvexityData } from 'api/convexity'
import { useStore } from 'api/cosmosStores'
import { DashboardProps } from './reflection'
import { BigNumber, utils } from 'ethers'
import { observer } from 'mobx-react-lite'
import DashBoardContent from './content'
import { IAvailableBorrowsData } from 'components/Borrows/DataList/AvailableBorrowsDataList'
import { IAvailableDepositsData } from 'components/Deposits/DataList/AvailableDepositsDataList'

const Convexity: React.FC<DashboardProps> = ({ depositsColumns, borrowsColumns, availableMarketsColumns }) => {
  const { accountStore, chainStore, queriesStore } = useStore()
  const { ConvexityAccountData, RegisteredTokens, getConvexityData } = useConvexityData()
  const account = accountStore.getAccount(chainStore.current.chainId)
  const [myDepositsTotal, setMyDepositsTotal] = useState<number>(0)
  const [myBorrowsTotal, setMyBorrowsTotal] = useState<number>(0)
  const [totalCollateral, setTotalCollateral] = useState<string>('0')
  const [borrowLimitUsed, setBorrowLimitUsed] = useState<number>(0)
  const [borrowLimit, setBorrowLimit] = useState<number>(0)

  const queries = queriesStore.get(chainStore.current.chainId)

  const walletBalances = chainStore.current.currencies.map((currency) => {
    const balance = BigNumber.from(
      queries.queryBalances.getQueryBech32Address(account.bech32Address).getBalanceFromCurrency(currency).toCoin()
        .amount,
    )

    return {
      denom: currency.coinDenom,
      amount: balance,
    }
  })

  const availableDepositsData = useMemo(() => {
    let depositReserves = RegisteredTokens.reduce((acc, token, i) => {
      const balance = walletBalances.find((balance) => balance.denom == token.name)
      if (token.loaned.isZero()) {
        acc.push({
          address: token.address,
          symbol: token.name,
          tokenBalance: balance?.amount,
          apy: token.depositAPY,
          decimals: token.decimals.toNumber(),
          usageAsCollateralEnabled: token.usageAsCollateralEnabled,
          chain: token.chainName,
          logo: token.logo,
        })
      }
      return acc
    }, Array<IAvailableDepositsData>())

    const orderedAvailableDeposits = depositReserves.sort(
      (deposit1, deposit2) =>
        (deposit2.tokenBalance ? deposit2.tokenBalance.toNumber() : 0) -
        (deposit1.tokenBalance ? deposit1.tokenBalance.toNumber() : 0),
    )
    return orderedAvailableDeposits
  }, [RegisteredTokens, walletBalances])

  const depositData = useMemo(() => {
    const deposits = RegisteredTokens.filter((d) => !d.loaned.isZero()).map((reserve) => {
      return {
        symbol: reserve.name,
        address: reserve.address,
        decimals: reserve.decimals,
        usdPrice: Number(reserve.usdPrice),
        currentUTokenBalance: reserve.loaned,
        currentStableDebt: BigNumber.from(0),
        currentVariableDebt: reserve.borrowed,
        principalStableDebt: BigNumber.from(0),
        scaledVariableDebt: BigNumber.from(0),
        stableBorrowRate: BigNumber.from(0),
        liquidityRate: reserve.depositAPY,
        usageAsCollateralEnabled: reserve.usageAsCollateralEnabled,
        chain: reserve.chainName,
        logo: reserve.logo,
      }
    })

    const orderedDeposits = deposits.sort(
      (deposit1, deposit2) => deposit2.currentUTokenBalance.toNumber() - deposit1.currentUTokenBalance.toNumber(),
    )
    return orderedDeposits
  }, [RegisteredTokens])

  const borrowData = useMemo(() => {
    const borrows = RegisteredTokens.filter((d) => !d.borrowed.isZero()).map((reserve) => {
      return {
        symbol: reserve.name,
        address: reserve.address,
        decimals: reserve.decimals,
        usdPrice: Number(reserve.usdPrice),
        currentUTokenBalance: reserve.loaned,
        currentStableDebt: BigNumber.from(0),
        currentVariableDebt: reserve.borrowed,
        principalStableDebt: BigNumber.from(0),
        scaledVariableDebt: BigNumber.from(0),
        stableBorrowRate: BigNumber.from(0),
        liquidityRate: reserve.depositAPY,
        usageAsCollateralEnabled: reserve.usageAsCollateralEnabled,
        variableBorrowAPR: reserve.variableBorrowAPR,
        stableBorrowAPR: BigNumber.from(0),
        chain: reserve.chainName,
        logo: reserve.logo,
      }
    })

    const orderedBorrows = borrows.sort(
      (deposit1, deposit2) => deposit2.currentVariableDebt.toNumber() - deposit1.currentVariableDebt.toNumber(),
    )
    return orderedBorrows
  }, [RegisteredTokens])

  const availableBorrowsData = useMemo(() => {
    let orderedAvailableBorrows: IAvailableBorrowsData[] = []

    if (ConvexityAccountData) {
      const tokens = RegisteredTokens.reduce((acc, token) => {
        let availableAmount
        const usdPrice = token.usdPrice
        const availableAmountUsd =
          Number(ConvexityAccountData.borrowLimit) * 0.8 - Number(ConvexityAccountData.totalBorrowed)
        availableAmount =
          availableAmountUsd > 0 && Number(usdPrice) > 0
            ? utils.parseUnits(
              (availableAmountUsd / Number(usdPrice)).toFixed(token.decimals.toNumber()).toString(),
              token.decimals,
            )
            : BigNumber.from(0)
        const availableLiquidity = token.availableLiquidity

        if (token.borrowed.isZero()) {
          acc.push({
            address: token.address,
            symbol: token.name,
            tokensAvailable: availableLiquidity.gt(availableAmount) ? availableAmount : availableLiquidity,
            variableAPR: token.variableBorrowAPR,
            decimals: token.decimals.toNumber(),
            borrowingEnabled: true,
            chain: token.chainName,
            logo: token.logo,
          })
        }

        return acc
      }, Array<IAvailableBorrowsData>())

      orderedAvailableBorrows = tokens.sort(
        (asset1, asset2) =>
          (asset2.tokensAvailable ? asset2.tokensAvailable.toNumber() : 0) -
          (asset1.tokensAvailable ? asset1.tokensAvailable?.toNumber() : 0),
      )
      return orderedAvailableBorrows
    }

    return orderedAvailableBorrows
  }, [ConvexityAccountData, RegisteredTokens])

  const averageAPY = useMemo(() => {
    let apy = 0
    const averageLoanApy = RegisteredTokens.reduce((acc, reserve) => {
      if (!reserve.loaned.isZero()) {
        const loaned = parseFloat(utils.formatUnits(reserve.loaned, reserve.decimals))
        const usd = parseFloat(reserve.usdPrice)
        const apy = parseFloat(reserve.depositAPY)
        const totalAmountLoaned = loaned * usd
        const netApy = (apy / 100) * totalAmountLoaned
        acc += netApy
      }
      return acc
    }, 0)
    const averageBorrowApy = RegisteredTokens.reduce((acc, reserve) => {
      if (!reserve.borrowed.isZero()) {
        const borrowed = parseFloat(utils.formatUnits(reserve.borrowed, reserve.decimals))
        const usd = parseFloat(reserve.usdPrice)
        apy = parseFloat(reserve.variableBorrowAPR)
        const totalAmountBorrowed = borrowed * usd
        const netApy = (apy / 100) * totalAmountBorrowed
        acc += netApy
      }
      return acc
    }, 0)
    if (myDepositsTotal > 0) {
      const apy = ((averageLoanApy - averageBorrowApy) / myDepositsTotal) * 100
      if (!isNaN(apy)) return apy
    }

    return apy
  }, [RegisteredTokens, myDepositsTotal])

  useEffect(() => {
    if (ConvexityAccountData) {
      const totalBorrowedUsd = Number(ConvexityAccountData.totalBorrowed)
      const borrowLimitUsd = Number(ConvexityAccountData.borrowLimit)
      const totalLoanedUsd = ConvexityAccountData.totalLoaned
      setMyDepositsTotal(Number(totalLoanedUsd))
      setMyBorrowsTotal(totalBorrowedUsd)
      setTotalCollateral(ConvexityAccountData.totalCollateral)
      setBorrowLimit(borrowLimitUsd)
      setBorrowLimitUsed(borrowLimitUsd > 0 ? (totalBorrowedUsd / borrowLimitUsd) * 100 : 0)
    }
  }, [ConvexityAccountData])

  return (
    <>
      <DashBoardContent
        logedIn={!!account.bech32Address}
        accountData={!!ConvexityAccountData}
        myDepositsTotal={myDepositsTotal}
        myBorrowsTotal={myBorrowsTotal}
        totalCollateral={totalCollateral}
        borrowLimit={borrowLimit}
        averageAPY={averageAPY}
        borrowLimitUsed={borrowLimitUsed}
        depositData={depositData}
        availableDepositsData={availableDepositsData}
        borrowData={borrowData}
        availableBorrowsData={availableBorrowsData}
        depositsColumns={depositsColumns}
        borrowsColumns={borrowsColumns}
        availableMarketsColumns={availableMarketsColumns}
      />
    </>
  )
}

export default observer(Convexity)

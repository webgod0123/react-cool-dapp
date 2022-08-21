import React, { useMemo } from 'react'
import { useConvexityData } from 'api/convexity'
import { useData } from 'api/data'
import { BoxProps, Text } from 'grommet'
import { Chain, useChain } from 'lib/hooks/chain/context'

export const UsdPrice = ({
  textSize,
  txnAmount,
  symbol,
  color,
  margin,
}: {
  textSize?: string
  txnAmount: string
  symbol?: string
  color?: string
  margin?: BoxProps['margin']
}) => {
  const { chainMode } = useChain()
  const { priceData } = useData()
  const { ConvexityPriceData } = useConvexityData()

  const usdPrice = useMemo(() => {
    if (txnAmount && symbol) {
      if (chainMode == Chain.ethereum) {
        if (priceData) return Number(txnAmount) * priceData[symbol].usd
        else return 0
      } else {
        const priceData = ConvexityPriceData?.find((price) => price.denom.toLowerCase() === symbol.toLowerCase())
        if (priceData) return Number(txnAmount) * Number(priceData.amount)
        else return 0
      }
    } else {
      return 0
    }
  }, [priceData, symbol, txnAmount, chainMode, ConvexityPriceData])

  return (
    <Text
      margin={margin}
      size={textSize || 'small'}
      color={color || 'clrMidGreyOnNavy'}
    >
      ${usdPrice ? Number(usdPrice.toFixed(2)).toLocaleString() : '0.00'}
    </Text>
  )
}

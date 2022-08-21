import React from 'react'
import GradientBox from '../common/GradientBox/GradientBox'
import { Box, Text } from 'grommet'
import { PrimaryText, TokenItem } from '../DataList'
import { BigNumber } from 'ethers'

interface Props {
  symbol: string
  noGradient: boolean
  chainName?: string
  values: { label: string; value: string | number | BigNumber; color?: string }[]
  onClick?: () => void
  collateral?: boolean
  logo?: string
}

export const AssetCard = ({ symbol, noGradient, onClick, values, chainName, collateral, logo }: Props) => (
  <GradientBox pad="medium" noGradient={noGradient} onClick={onClick}>
    <Box direction="row" align="center">
      <Box flex="grow">
        {symbol && <TokenItem logo={logo} textSize="small" symbol={symbol} chain={chainName} collateral={collateral} />}
      </Box>
      <Box align="end">
        {values.map((value, index) => (
          <Box direction="row" align="center" key={index}>
            <PrimaryText color={value.color || 'clrTextPrimary'} size="small">
              {value.value}
            </PrimaryText>
            <Text color={'clrTextGrey'} margin={{ left: 'xsmall' }} size="small">
              {value.label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  </GradientBox>
)

AssetCard.defaultProps = {
  noGradient: true,
}

import * as React from 'react'
import { Box, BoxProps, Text, TextProps } from 'grommet'
import TokenLogo from '../TokenLogo'
import Collateral from './Collateral'

export interface TokenItemProps {
  gap?: BoxProps['gap']
  textSize?: TextProps['size']
  iconWidth?: BoxProps['width']
  iconHeight?: BoxProps['height']
  symbol: string
  handleClick?: React.Dispatch<any>
  fontFamily?: string
  chain?: string
  collateral?: boolean | undefined
  logo?: string
}

const TokenItem = ({
  gap,
  iconHeight,
  iconWidth,
  symbol,
  textSize,
  handleClick,
  fontFamily,
  chain,
  collateral,
  logo
}: TokenItemProps) => {
  return (
    <Box onClick={handleClick} direction="row" align="center">
      <Box>
        <TokenLogo width="36" height="36" src={logo} />
      </Box>
      <Box margin={{ left: 'small' }}>
        <Box direction="row" align="center">
          <Text
            size={textSize || 'small'}
            margin={{ right: 'xsmall' }}
            color="clrTextPrimary"
            style={{ fontFamily: fontFamily }}
          >
            {symbol == 'WETH' ? 'ETH' : symbol}
          </Text>
          <Collateral collateral={collateral} />
        </Box>
        {chain && (
          <Box margin={{ top: 'xsmall' }}>
            <Text size={'xsmall'} color="clrTextSecondary">
              {chain}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TokenItem

import React from 'react'
import { Box, BoxProps, Text, TextProps } from 'grommet'

interface Collateral extends BoxProps {
  collateral?: boolean | undefined
  count?: number
  selected?: boolean
  filtering?: boolean
  onClick?: () => void
}

export const CollateralContent = ({
  color,
  count,
  collateral,
  textSize,
}: {
  color?: string
  count?: number
  collateral?: boolean
  textSize?: TextProps['size']
}) => (
  <Box direction="row" align="center">
    <Text margin={{ right: count !== undefined ? 'xsmall' : '' }} size={textSize || 'xsmall'} color={color}>
      {count}
    </Text>
    <Text color={color} size={textSize || 'xsmall'}>
      {collateral ? 'Collateral' : 'Leverage'}
    </Text>
  </Box>
)

const Collateral = ({ collateral, count, selected, filtering, onClick, ...props }: Collateral) => {
  const color = (collateral?: boolean) => {
    if (collateral) return 'clrSupply'
    else return 'clrBorrow'
  }

  const textColor = (collateral?: boolean) => {
    if (collateral) return 'clrSupplyText'
    else return 'clrBorrowText'
  }

  return (
    <>
      {collateral !== undefined && (
        <Box
          direction="row"
          border={
            filtering
              ? selected
                ? { color: color(collateral) }
                : { color: 'clrBorderGrey' }
              : { color: color(collateral) }
          }
          round={props.round || 'large'}
          pad={{ horizontal: '10px', vertical: filtering ? '8px' : '3px' }}
          background="clrBorderGrey"
          onClick={onClick}
          {...props}
        >
          <CollateralContent color={textColor(collateral)} collateral={collateral} count={count} />
        </Box>
      )}
    </>
  )
}

export default Collateral

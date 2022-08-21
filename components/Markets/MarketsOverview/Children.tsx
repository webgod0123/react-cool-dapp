import React from 'react'
import { Box, Meter } from 'grommet'
import { InfoPanelItem } from 'components/InfoBar'
import { InfoPanelItemStyles } from 'components/InfoBar/InfoPanelItem'

interface MarketsChildrenProps {
  symbol: string
  value: string
  percent?: number
  color?: string
}

const MarketsChildren = ({ symbol, value, percent, color }: MarketsChildrenProps) => {
  return (
    <Box margin={{ top: 'small' }}>
      <InfoPanelItem
        title={symbol}
        textSize="small"
        justify="between"
        style={InfoPanelItemStyles.Horizontal}
        data={[
          { value: '$', textSize: 'small' },
          { value: value, textSize: 'small' },
        ]}
      />
      <Box margin={{ top: 'xsmall' }}>
        <Meter
          size="full"
          thickness="3px"
          values={[
            {
              value: percent || 0,
              label: 'markets',
              color: color,
            },
          ]}
          background={`${color}Opacity`}
        />
      </Box>
    </Box>
  )
}

export default MarketsChildren

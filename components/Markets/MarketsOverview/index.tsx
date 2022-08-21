import React, { useContext } from 'react'
import { InfoBarBody } from 'components/InfoBar'
import { ResponsiveContext, Text, Box } from 'grommet'
import Overview from 'components/common/Overview'
import MarketsChildren from './Children'
import { Amount } from 'api/convexity/data'

export interface MarketsOverview {
  title: string
  value: string
  color?: string
  children: Amount[]
}

const MarketsOverview = ({ overviews }: { overviews: MarketsOverview[] }) => {
  const size = useContext(ResponsiveContext)

  return (
    <InfoBarBody
      gap={size === 'small' ? 'large' : 'medium'}
      direction={size === 'medium' || size === 'small' ? 'column' : 'row'}
    >
      {overviews.map((overview, index) => (
        <Overview
          key={index}
          title={overview.title}
          value={Number(overview.value).toLocaleString()}
          pad={size === 'small' ? 'large' : 'medium'}
          flex
          color={`${overview.color}Text`}
          price
        >
          <Box margin={{ top: 'medium' }} pad={{ top: 'small' }}>
            <Text size="small" margin={{ bottom: 'small' }} color="clrTextPrimary">
              Top Markets
            </Text>
            {overview.children.length === 0 ? Array(3).fill(0).map((_, index) => (
              <MarketsChildren
                key={index}
                symbol=''
                value=''
                color={overview.color}
              />
            )) : overview.children.map((children, index) => (
              <MarketsChildren
                key={index}
                symbol={children.denom}
                value={children.amount}
                percent={children.percent}
                color={overview.color}
              />
            ))}
          </Box>
        </Overview>
      ))}
    </InfoBarBody>
  )
}

export default MarketsOverview

import React, { useContext } from 'react'
import { BigNumber } from 'ethers'
import { BoxProps, ResponsiveContext } from 'grommet'
import Overview from 'components/common/Overview'
import { bigNumberToNumber, fixedLocaleString } from 'lib/number-utils'
import { InfoBarBody } from 'components'
import TotalStaked from 'components/TotalStaked'

interface OverviewProps extends BoxProps {
  currentAPR: string
  pendingReward: BigNumber
}

const StakeOverview = ({ pendingReward, currentAPR, ...props }: OverviewProps) => {
  const size = useContext(ResponsiveContext)

  return (
    <InfoBarBody
      gap={size === 'small' ? 'large' : 'medium'}
      direction={size === 'medium' || size === 'small' ? 'column' : 'row'}
      {...props}
    >
      <Overview
        pad={size === 'small' ? 'large' : 'medium'}
        title="Total Staked"
        value={<TotalStaked size="medium1" />}
        flex
      />
      <Overview pad={size === 'small' ? 'large' : 'medium'} unit="%" title="Current APR" value={currentAPR} flex />
      <Overview
        pad={size === 'small' ? 'large' : 'medium'}
        title="Pending Reward"
        value={fixedLocaleString(bigNumberToNumber(pendingReward, 6), 2)}
        color="clrBorrowText"
        unit="UMEE"
        flex
      />
    </InfoBarBody>
  )
}

export default StakeOverview

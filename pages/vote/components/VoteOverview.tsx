import React, { useContext, useEffect, useMemo } from 'react'
import { useStake } from 'api/stake'
import { BoxProps, ResponsiveContext } from 'grommet'
import Overview from 'components/common/Overview'
import { InfoBarBody } from 'components'
import { VotedType } from 'api/stake/data'
import TotalStaked from 'components/TotalStaked'
import { observer } from 'mobx-react-lite'
import { useStore } from 'api/cosmosStores'
import { WalletStatus } from '@keplr-wallet/stores'

interface OverviewProps extends BoxProps {}

const VoteOverview = ({ ...props }: OverviewProps) => {
  const { accountStore } = useStore()
  const account = accountStore.getAccount('umee-1')
  const { Proposals } = useStake()
  const size = useContext(ResponsiveContext)

  useEffect(() => {
    if (account.walletStatus === WalletStatus.NotInit) account.init()
  }, [account])

  const pendingProposals = useMemo(() => {
    let num = 0
    if (Proposals) {
      const pending = account.bech32Address
        ? Proposals.filter((proposal) => proposal.status === 2 && proposal.voted === VotedType.NEVER)
        : Proposals.filter((proposal) => proposal.status === 2)
      num = pending.length
    }
    return num
  }, [Proposals, account.bech32Address])

  const votedProposals = useMemo(() => {
    let num = 0
    if (Proposals) {
      const pending = Proposals.filter((proposal) => proposal.voted !== VotedType.NEVER)
      num = account.bech32Address ? pending.length : 0
    }
    return num
  }, [Proposals, account.bech32Address])

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
      <Overview
        pad={size === 'small' ? 'large' : 'medium'}
        title="Pending Votes"
        value={pendingProposals.toString()}
        flex
      />
      <Overview
        pad={size === 'small' ? 'large' : 'medium'}
        title="Voting Record"
        value={`${votedProposals}/${Proposals?.length}`}
        color="clrDanger"
        flex
      />
    </InfoBarBody>
  )
}

export default observer(VoteOverview)

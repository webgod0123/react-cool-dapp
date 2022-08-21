import React, { useEffect, useMemo, useState } from 'react'
import Layout from 'pages/Layout'
import { useStake } from 'api/stake'
import { IDataListColumn } from 'components/DataList/DataList'
import PageLoading from 'components/common/Loading/PageLoading'
import ValidatorList from './components/ValidatorList'
import DelegationList, { ActiveDelegation } from './components/DelegationList'
import { BigNumber } from 'ethers'
import { observer } from 'mobx-react-lite'
import CompoundReward from './components/CompoundReward'
import { useStore } from 'api/cosmosStores'
import { Grant, Validator } from 'api/stake/data'
import { buildGrants } from 'api/stake/grants'
import Overview from './components/StakeOverview'

const Container = () => {
  const {
    Validators,
    Delegations,
    Rewards,
    Grants,
    Operators,
    apr,
    validatorAPR,
    fetchValidators,
    fetchDelegations,
    fetchRewards,
    fetchOperators,
    fetchGrants,
    fetchAPR,
  } = useStake()
  const [delegations, setDelegations] = useState<ActiveDelegation[]>()
  const [validators, setValidators] = useState<Validator[]>()
  const [grants, setGrants] = useState<Grant>({})
  const { accountStore, chainStore } = useStore()
  const account = accountStore.getAccount('umee-1')
  const chain = chainStore.getChain('umee-1')

  const loading = useMemo(() => {
    if (!Validators) return true
  }, [Validators])

  useEffect(() => {
    fetchValidators()
    fetchDelegations()
    fetchRewards()
    fetchOperators()
    fetchGrants()
    fetchAPR()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const rewardsInterval = setInterval(() => {
      fetchRewards()
    }, 15_000)

    return () => {
      clearInterval(rewardsInterval)
    }
  }, [fetchRewards])

  useEffect(() => {
    const delegationsInterval = setInterval(() => {
      fetchDelegations()
    }, 30_000)

    return () => {
      clearInterval(delegationsInterval)
    }
  }, [fetchDelegations])

  const pendingReward = useMemo(() => {
    let reward = BigNumber.from(0)

    if (Rewards) {
      const total = Rewards.total
      if (total && total.length > 0) reward = BigNumber.from(Math.round(Number(total[0].amount)))
    }

    return reward
  }, [Rewards])

  useEffect(() => {
    if (!Grants || !Rewards) return

    const denom = chain.stakeCurrency.coinMinimalDenom
    const grants = Grants.reduce((sum, grants) => {
      const botAddress = grants.botAddress
      const operatorAddress = grants.operatorAddress
      const operatorGrant = buildGrants(grants, botAddress, account.bech32Address)
      const defaultGrant = {
        claimGrant: null,
        stakeGrant: null,
        validators: [],
        grantsValid: false,
        grantsExist: false,
      }
      const grant = operatorGrant || defaultGrant
      const rewardsArr = Rewards.rewards
      let reward = '0'

      if (rewardsArr) {
        const validatorReward = rewardsArr.find((reward) => reward.validator_address === operatorAddress)
        if (validatorReward && validatorReward.reward) {
          const rewardAmount = validatorReward.reward.find((el) => el.denom === denom)
          reward = rewardAmount ? rewardAmount.amount : '0'
        }
      }

      sum[operatorAddress] = {
        ...grant,
        grantsValid: !!(
          grant.stakeGrant &&
          (!grant.validators || grant.validators.includes(operatorAddress)) &&
          (grant.maxTokens === null || grant.maxTokens.gt(BigNumber.from(Number(reward).toFixed(0))))
        ),
        grantsExist: !!(grant.claimGrant || grant.stakeGrant),
      }

      return sum
    }, {})

    setGrants(grants)
  }, [Rewards, Grants, chain, account.bech32Address])

  useEffect(() => {
    if (Validators && Delegations) {
      let delegations = Delegations.sort((a, b) => {
        const firstBalance = typeof a.balance === 'string' ? a.balance : a.balance.amount
        const secondBalance = typeof b.balance === 'string' ? b.balance : b.balance.amount
        return Number(secondBalance) - Number(firstBalance)
      })

      let activeDelegations: ActiveDelegation[] = []
      delegations.map((delegation) => {
        const validator_address = delegation.validator_address
        const validator = Validators.find((validator) => validator.operator_address === validator_address)
        const balance = typeof delegation.balance === 'string' ? delegation.balance : delegation.balance.amount

        const activeDelegation: any = {
          validator_address: validator_address,
          validator: validator,
          staked_amount: BigNumber.from(balance),
          reward_amount: BigNumber.from(0),
        }

        if (Rewards && Rewards.rewards) {
          const rewards = Rewards.rewards
          const rewardAmount = rewards.find((reward) => reward.validator_address === validator_address)
          if (rewardAmount && rewardAmount.reward)
            activeDelegation.reward_amount = BigNumber.from(Number(rewardAmount.reward[0].amount).toFixed(0))
        }

        if (validator) activeDelegations.push(activeDelegation)
      })

      setDelegations(activeDelegations)
    }
  }, [Validators, Delegations, Rewards])

  useEffect(() => {
    if (Validators) {
      let validatorList = [...Validators]
      validatorList.map((validator) => {
        validator.apr = parseFloat(validatorAPR(Operators, validator))
      })

      setValidators(validatorList)
    }
  }, [Validators, validatorAPR, Operators])

  const validatorColumns: IDataListColumn[] = [
    { title: 'ACTIVE VALIDATORS', size: 'flex', sortLabel: 'moniker', sortable: true },
    { title: 'Annual APY', size: 'flex', jusitfy: 'end', sortLabel: 'apr', sortable: true },
    { title: 'Voting Power', size: 'flex', jusitfy: 'end', sortLabel: 'tokens', sortable: true },
    { title: 'AUTO COMPOUND', size: '15%', jusitfy: 'end' },
    { title: '', size: '15%', jusitfy: 'center' },
  ]

  const delegationColumns: IDataListColumn[] = [
    { title: 'YOUR STAKED POSITIONS', size: 'flex' },
    { title: 'AMOUNT STAKED', size: 'flex', jusitfy: 'end' },
    { title: 'PENDING REWARD', size: 'flex', jusitfy: 'end' },
    { title: 'AUTO COMPOUND', size: '15%', jusitfy: 'end' },
    { title: '', size: '15%', jusitfy: 'center' },
  ]

  return (
    <Layout
      title="Stake"
      toggleChain={false}
      element={delegations && <CompoundReward pendingReward={pendingReward} delegations={delegations} />}
    >
      {loading ? (
        <PageLoading />
      ) : (
        <>
          <Overview margin={{ bottom: 'large' }} pendingReward={pendingReward} currentAPR={(apr * 100).toFixed(2)} />
          {delegations && <DelegationList allGrants={grants} delegations={delegations} columns={delegationColumns} />}
          {validators && <ValidatorList activeColumns={validatorColumns} activeValidators={validators} />}
        </>
      )}
    </Layout>
  )
}

export default observer(Container)

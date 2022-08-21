import React, { useEffect } from 'react'
import { PrimaryBtn } from 'components/common'
import { BigNumber } from 'ethers'
import { coin as _coin } from '@cosmjs/stargate'
import { useStore } from 'api/cosmosStores'
import { useFakeFeeConfig } from 'lib/hooks'
import { WalletStatus } from '@keplr-wallet/stores'
import { displayToast, TToastType } from 'components/common/toasts'
import { ActiveDelegation } from './DelegationList'
import { useStake } from 'api/stake'

const CompoundReward = ({
  pendingReward,
  delegations,
}: {
  pendingReward: BigNumber
  delegations: ActiveDelegation[]
}) => {
  const { fetchDelegations, fetchValidators, fetchRewards } = useStake()
  const { accountStore, chainStore } = useStore()
  const account = accountStore.getAccount('umee-1')
  const coinDenom = chainStore.getChain('umee-1').stakeCurrency.coinMinimalDenom

  const feeConfig = useFakeFeeConfig(
    chainStore,
    'umee-1',
    account.msgOpts.delegate.gas * delegations.length,
  )

  useEffect(() => {
    if (account.walletStatus === WalletStatus.NotInit) account.init()
  }, [account])

  const compoundReward = async () => {
    if (pendingReward.isZero()) return

    let compoundData: any[] = []

    if (delegations) {
      const fee = feeConfig.fee.toCoin().amount

      delegations.map((reward) => {
        const rewardBalance = reward.reward_amount.toNumber()
        const shareOfFee = (rewardBalance / pendingReward.toNumber()) * Number(fee)
        const compoundAmount = rewardBalance - shareOfFee

        if (compoundAmount > 0)
          compoundData.push({
            validatorAddress: reward.validator_address,
            amount: _coin(Math.round(compoundAmount), coinDenom),
          })
      })

      if (compoundData.length < delegations.length) {
        displayToast('Reward is too law!', TToastType.TX_FAILED)
        return
      } else {
        try {
          await account.umee.compoundReward(account.bech32Address, compoundData, () => {
            fetchValidators()
            fetchDelegations()
            fetchRewards()
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
  }

  return (
    <>
      {!pendingReward.isZero() && (
        <PrimaryBtn
          round="large"
          pad={{ vertical: 'small', horizontal: 'small' }}
          textSize="xsmall"
          text="COMPOUND REWARD"
          onClick={() => compoundReward()}
        />
      )}
    </>
  )
}

export default CompoundReward

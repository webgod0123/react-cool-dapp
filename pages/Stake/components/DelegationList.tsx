import React, { useMemo, useState, MouseEvent, useCallback } from 'react'
import { Grant, OperatorGrant, Validator } from 'api/stake/data'
import DataList, { IDataListColumn } from 'components/DataList/DataList'
import { BigNumber } from 'ethers'
import { truncateAfterDecimals } from 'lib/number-utils'
import { Box, BoxProps, Text } from 'grommet'
import { useTheme } from 'lib/hooks/theme/context'
import { DelegateType } from 'lib/types'
import Delegate from './Modals/Delegate'
import { useFakeFeeConfig } from 'lib/hooks'
import { useStore } from 'api/cosmosStores'
import { displayToast, TToastType } from 'components/common/toasts'
import { useStake } from 'api/stake'
import UnDelegate from './Modals/Undelegate'
import ReDelegate from './Modals/Redelegate'
import ValidatorDetail from './Modals/Detail'
import { useAuthz } from 'lib/hooks/authz'
import Delegation from './Delegation'

export interface ActiveDelegation {
  validator_address: string
  staked_amount: BigNumber
  reward_amount: BigNumber
  validator: Validator
}

interface DelegationListProps {
  delegations: ActiveDelegation[]
  columns: IDataListColumn[]
  allGrants: Grant | undefined
}

const DelegationList = ({ delegations, columns, allGrants }: DelegationListProps) => {
  const columnSizes = columns.map((col) => col.size)
  const [open, setOpen] = useState<string>('')
  const [openModal, setOpenModal] = useState<DelegateType>()
  const [openValidatorModal, setOpenValidatorModal] = useState<boolean>()
  const [selectedValidator, setSelectedValidator] = useState<Validator>()
  const { sendGrantMsgs, sendRevokeMsgs } = useAuthz()
  const { accountStore, chainStore } = useStore()
  const { Rewards, Operators, fetchGrants, fetchRewards, fetchDelegations } = useStake()

  const account = accountStore.getAccount('umee-1')
  const claimFeeConfig = useFakeFeeConfig(chainStore, 'umee-1', account.msgOpts.withdrawRewards.gas)
  const compoundFeeConfig = useFakeFeeConfig(chainStore, 'umee-1', account.msgOpts.delegate.gas)

  const totalReward = useMemo(() => {
    if (Rewards) {
      const total = Rewards.total
      if (total && total.length > 0) return Number(total[0].amount)
    }
  }, [Rewards])

  const onMenuClick = (menu: DelegateType, validator: Validator) => {
    setOpen('')
    setOpenModal(menu)
    setSelectedValidator(validator)
  }

  const claimRewards = async (validator: Validator, compounding: boolean) => {
    setOpen('')
    if (!totalReward) return
    const delegation = delegations.find((delegation) => delegation.validator_address === validator.operator_address)
    const reward = delegation?.reward_amount.toNumber() || 0
    const validator_address = validator.operator_address
    const fee = !compounding
      ? Number(claimFeeConfig.fee.toCoin().amount)
      : Number(compoundFeeConfig.fee.toCoin().amount)
    const amount = reward - fee

    if (amount <= 0) {
      displayToast('Reward is too law!', TToastType.TX_FAILED)
      return
    }

    if (!compounding) {
      try {
        await account.cosmos.sendWithdrawDelegationRewardMsgs([validator_address], '', undefined, undefined, {
          onBroadcasted: (txHash: Uint8Array) => {
            displayToast('Claiming Rewards', TToastType.TX_BROADCASTING)
          },
          onFulfill: (tx) => {
            if (!tx.code) {
              displayToast('Claim Successful', TToastType.TX_SUCCESSFUL, {
                customLink: chainStore
                  .getChain('umee-1')
                  .raw.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
              })
            }
          },
        })
      } catch (e) {
        console.log(e)
      }
    } else {
      const decimals = Math.pow(10, 6)
      const compoundAmount = truncateAfterDecimals(amount, 6) / decimals

      try {
        await account.cosmos.sendDelegateMsg(compoundAmount.toString(), validator_address, '', undefined, undefined, {
          onBroadcasted: (txHash: Uint8Array) => {
            displayToast('Compounding Rewards', TToastType.TX_BROADCASTING)
          },
          onFulfill: (tx) => {
            if (!tx.code) {
              displayToast('Compound Successful', TToastType.TX_SUCCESSFUL, {
                customLink: chainStore
                  .getChain('umee-1')
                  .raw.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
              })
            }
          },
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  const operatorGrants = useCallback(
    (operatorAddress: string) => {
      const grants = allGrants && allGrants[operatorAddress]
      return grants
    },
    [allGrants],
  )

  const restakePossible = useCallback(
    (validatorAddress: string) => {
      let possible: undefined | boolean = undefined

      if (Operators) {
        possible = !!Operators.find((operator) => operator.address === validatorAddress)
      }
      return possible
    },
    [Operators],
  )

  const fetchData = () => {
    fetchDelegations()
    fetchRewards()
    fetchGrants()
  }

  const autoCompound = async (validator: Validator, grants: OperatorGrant) => {
    if (!grants.grantsExist)
      await sendGrantMsgs(
        validator.restake?.address || '',
        account.bech32Address,
        validator.operator_address,
        fetchData,
      )
    else await sendRevokeMsgs(validator.restake?.address || '', account.bech32Address, grants, fetchData)
  }

  const closeModal = () => {
    setOpenModal(undefined)
  }

  return (
    <Box margin={{ bottom: delegations.length ? 'large' : '' }}>
      {selectedValidator && (
        <>
          {openModal === DelegateType.delegate && <Delegate validator={selectedValidator} onClose={closeModal} />}
          {openModal === DelegateType.undelegate && <UnDelegate validator={selectedValidator} onClose={closeModal} />}
          {openModal === DelegateType.redelegate && <ReDelegate validator={selectedValidator} onClose={closeModal} />}
          {openValidatorModal && (
            <ValidatorDetail
              onMenuClick={onMenuClick}
              onClose={() => setOpenValidatorModal(false)}
              validator={selectedValidator}
              claimRewards={claimRewards}
              restakePossible={restakePossible(selectedValidator.operator_address)}
              grants={operatorGrants(selectedValidator.operator_address)}
              autoCompound={autoCompound}
            />
          )}
        </>
      )}
      {delegations.length > 0 && (
        <DataList columns={columns}>
          {delegations.map((delegation, index) => (
            <Delegation
              key={index}
              delegation={delegation}
              grants={operatorGrants(delegation.validator_address)}
              columnSizes={columnSizes}
              claimRewards={claimRewards}
              onMenuClick={onMenuClick}
              menuOpen={open}
              setOpen={setOpen}
              reStakePossible={!!restakePossible(delegation.validator_address)}
              autoCompound={autoCompound}
              onRowClick={(validator) => {
                setSelectedValidator(validator)
                setOpenValidatorModal(true)
              }}
            />
          ))}
        </DataList>
      )}
    </Box>
  )
}

export const MenuItem = ({
  border,
  title,
  onClick,
  menu,
}: {
  border?: BoxProps['border']
  title?: string
  onClick: (e: MouseEvent) => void
  menu?: React.ReactNode
}) => {
  const { themeMode } = useTheme()

  return (
    <Box
      onClick={(e) => onClick(e)}
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      className={`row-container row-container-${themeMode}`}
      border={border}
    >
      {menu ? (
        menu
      ) : (
        <Text size="small" color={'clrTextPrimary'}>
          {title}
        </Text>
      )}
    </Box>
  )
}

export default DelegationList

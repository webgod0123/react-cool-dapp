import React, { MouseEvent } from 'react'
import { OperatorGrant, Validator } from 'api/stake/data'
import { DataListRow, TextItem, PrimaryText } from 'components'
import { SecondaryBtnBox } from 'components/common/Buttons/SecondaryButtonBox'
import { GridSizeType, DropButton, Box } from 'grommet'
import { bigNumberToNumber, fixedLocaleString } from 'lib/number-utils'
import { DelegateType } from 'lib/types'
import { ActiveDelegation, MenuItem } from './DelegationList'
import ValidatorLogo from './ValidatorLogo'
import Spinner from 'components/common/Loading/Spinner'

const Delegation = ({
  delegation,
  grants,
  columnSizes,
  menuOpen,
  setOpen,
  claimRewards,
  onMenuClick,
  onRowClick,
  autoCompound,
  reStakePossible,
}: {
  delegation: ActiveDelegation
  grants: OperatorGrant | undefined
  columnSizes: GridSizeType[]
  menuOpen: string
  setOpen: (address: string) => void
  claimRewards: (validator: Validator, compounding: boolean) => void
  onMenuClick: (menu: DelegateType, validator: Validator) => void
  onRowClick: (validator: Validator) => void
  reStakePossible: boolean | undefined
  autoCompound: (validator: Validator, grants: OperatorGrant) => void
}) => {
  return (
    <DataListRow columnSizes={columnSizes} select={() => onRowClick(delegation.validator)}>
      <TextItem justify="start">
        {delegation.validator && (
          <ValidatorLogo isList title={delegation.validator.moniker} imgUrl={delegation.validator.img_url} />
        )}
      </TextItem>
      <TextItem justify="end">
        <PrimaryText color="clrTextPrimary">
          {fixedLocaleString(delegation.staked_amount ? bigNumberToNumber(delegation.staked_amount, 6) : 0, 2)} UMEE
        </PrimaryText>
      </TextItem>
      <TextItem justify="end">
        <PrimaryText color="clrTextPrimary">
          {fixedLocaleString(delegation.reward_amount ? bigNumberToNumber(delegation.reward_amount, 6) : 0, 2)} UMEE
        </PrimaryText>
      </TextItem>
      <TextItem justify="end">
        <PrimaryText color="clrTextPrimary">
          {reStakePossible !== undefined ? (
            reStakePossible ? (
              grants !== undefined ? (
                grants.grantsExist ? (
                  'Yes'
                ) : (
                  'No'
                )
              ) : (
                <Spinner />
              )
            ) : (
              'No'
            )
          ) : (
            <Spinner />
          )}
        </PrimaryText>
      </TextItem>
      <TextItem justify="center">
        <DropButton
          open={!!(delegation.validator_address === menuOpen)}
          onClose={() => setOpen('')}
          className="stake-manage"
          dropAlign={{ top: 'bottom', right: 'right' }}
          label={
            <SecondaryBtnBox
              pad={{ vertical: 'small', horizontal: 'small' }}
              round="xlarge"
              text="MANAGE"
              textSize="xsmall"
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                setOpen(delegation.validator_address)
              }}
            />
          }
          dropContent={
            <Box border={{ color: 'clrButtonBorderGrey', size: '1px' }} background="clrBackground">
              <MenuItem
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  claimRewards(delegation.validator, false)
                }}
                title="Claim Rewards"
              />
              <MenuItem
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  claimRewards(delegation.validator, true)
                }}
                title="Compound Rewards"
              />
              {(Object.keys(DelegateType) as Array<keyof typeof DelegateType>).map((key) => (
                <MenuItem
                  key={key}
                  border={
                    key === 'delegate' && {
                      color: 'clrButtonBorderGrey',
                      side: 'top',
                      size: '1px',
                    }
                  }
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation()
                    onMenuClick(DelegateType[key], delegation.validator)
                  }}
                  title={DelegateType[key]}
                />
              ))}
              {reStakePossible && grants && (
                <>
                  <MenuItem
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation()
                      autoCompound(delegation.validator, grants)
                    }}
                    border={{
                      color: 'clrButtonBorderGrey',
                      side: 'top',
                      size: '1px',
                    }}
                    title={grants.grantsExist ? 'Disable Auto-compound' : 'Auto-compound'}
                  />
                </>
              )}
            </Box>
          }
        />
      </TextItem>
    </DataListRow>
  )
}

export default Delegation

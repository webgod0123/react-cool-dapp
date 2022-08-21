import React, { useMemo, MouseEvent, useState } from 'react'
import Modal from 'components/common/Modals/Modal'
import { Box, DropButton, Text } from 'grommet'
import ValidatorLogo from '../ValidatorLogo'
import { InfoPanelItem } from 'components'
import { InfoPanelItemStyles } from 'components/InfoBar/InfoPanelItem'
import truncate from 'lib/truncate'
import { bigNumberToNumber, bigNumberToString } from 'lib/number-utils'
import { BigNumber } from 'ethers'
import { MenuItem } from '../DelegationList'
import { PrimaryBtn } from 'components/common'
import { DelegateType } from 'lib/types'
import { PrimaryBtnBox } from 'components/common/Buttons/PrimaryButtonBox'
import { OperatorGrant, Validator } from 'api/stake/data'
import { getTimePassed } from 'lib/timeRemaining'
import { useStake } from 'api/stake'

const tokenDecimals = BigNumber.from(6)

interface ValidatorDetailProps {
  validator: Validator
  restakePossible?: boolean
  grants?: OperatorGrant
  onClose: () => void
  onMenuClick: (menu: DelegateType, validator: Validator) => void
  claimRewards?: (validator: Validator, compounding: boolean) => void
  autoCompound: (validator: Validator, grants: OperatorGrant) => void
}

const ValidatorDetail = ({
  validator,
  onClose,
  onMenuClick,
  claimRewards,
  restakePossible,
  grants,
  autoCompound,
}: ValidatorDetailProps) => {
  const { Delegations, Rewards } = useStake()
  const [openMenu, setOpenMenu] = useState<boolean>()

  const commissionRate = (value: string) => {
    return (Number(value) * 100).toFixed(2)
  }

  const delegation = useMemo(() => {
    if (Delegations) {
      const delegation = Delegations.find((delegation) => delegation.validator_address === validator.operator_address)
      if (delegation) {
        const balance = typeof delegation.balance === 'string' ? delegation.balance : delegation.balance.amount
        return BigNumber.from(balance)
      }
    }
  }, [Delegations, validator.operator_address])

  const rewards = useMemo(() => {
    if (Rewards && Rewards.rewards) {
      const rewards = Rewards.rewards.find((delegation) => delegation.validator_address === validator.operator_address)
      if (rewards && rewards.reward) return BigNumber.from(Math.round(Number(rewards.reward[0].amount)))
    }
  }, [Rewards, validator.operator_address])

  const blocks = useMemo(() => {
    let blocks = []
    for (let i = 0; i < 100; i++) {
      blocks.push(i)
    }

    return blocks
  }, [])

  return (
    <Modal onClose={onClose} className="validator-modal">
      {validator && (
        <>
          <Box direction="row" justify="between">
            <ValidatorLogo
              title={validator.moniker}
              imgUrl={validator.img_url}
              width="45px"
              height="45px"
              fontFamily="Moret"
              textSize="24px"
              color="white"
            />
          </Box>
          <Box direction="row" flex gap="small" margin={{ top: 'small' }}>
            <Box width={'60%'}>
              <Box
                border={{ size: '1px', color: 'clrBoxBorder' }}
                round="xsmall"
                background="clrModalBackground"
                pad={'small'}
              >
                <Box direction="row" justify="between">
                  <Text size="small" color={'clrTextPrimary'}>
                    UPTIME
                  </Text>
                  <Text size="small" color={'clrTextPrimary'}>
                    Last 100 Blocks
                  </Text>
                </Box>
                <Box direction="row" justify="center">
                  <Box pad={'medium'} className="block-container">
                    {blocks.map((block, index) => (
                      <Box className="block" key={index} />
                    ))}
                  </Box>
                </Box>
              </Box>
              <Box flex direction="row" margin={{ top: 'small' }} gap="small">
                <Box
                  flex
                  border={{ size: '1px', color: 'clrBoxBorder' }}
                  round="xsmall"
                  background="clrModalBackground"
                  pad={'small'}
                >
                  <Text margin={{ bottom: 'small' }} size="xsmall" color={'clrTextPrimary'}>
                    STAKE INFORMATION
                  </Text>
                  <InfoPanelItem
                    title="Staked Amount"
                    textSize="xsmall"
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                    data={[
                      { value: delegation ? bigNumberToString(delegation, tokenDecimals) : '–', textSize: 'xsmall' },
                    ]}
                  />
                  <InfoPanelItem
                    title="Current Rewards"
                    textSize="xsmall"
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                    data={[{ value: rewards ? bigNumberToString(rewards, tokenDecimals) : '–', textSize: 'xsmall' }]}
                  />
                  {delegation ? (
                    <DropButton
                      className="stake-manage"
                      dropAlign={{ top: 'bottom', left: 'left' }}
                      open={openMenu}
                      onClose={() => setOpenMenu(false)}
                      label={
                        <PrimaryBtnBox
                          margin={{ top: 'small' }}
                          pad={'xsmall'}
                          round="large"
                          text="Manage"
                          textSize="small"
                          onClick={() => setOpenMenu(true)}
                        />
                      }
                      dropContent={
                        <Box border={{ color: 'clrButtonBorderGrey', size: '1px' }} background="clrModalBackground">
                          <MenuItem
                            onClick={() => (claimRewards ? claimRewards(validator, false) : null)}
                            title="Claim Rewards"
                          />
                          <MenuItem
                            onClick={() => (claimRewards ? claimRewards(validator, true) : null)}
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
                                setOpenMenu(false)
                                onMenuClick(DelegateType[key], validator)
                              }}
                              title={DelegateType[key]}
                            />
                          ))}
                        </Box>
                      }
                    />
                  ) : (
                    <PrimaryBtn
                      margin={{ top: 'small' }}
                      pad={'xsmall'}
                      round="large"
                      text="Stake"
                      textSize="small"
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation()
                        onMenuClick(DelegateType.delegate, validator)
                      }}
                    />
                  )}
                </Box>
                <Box
                  flex
                  border={{ size: '1px', color: 'clrBoxBorder' }}
                  round="xsmall"
                  background="clrModalBackground"
                  pad={'small'}
                >
                  <Text margin={{ bottom: 'small' }} size="xsmall" color={'clrTextPrimary'}>
                    COMPOUND OPTIONS
                  </Text>
                  <InfoPanelItem
                    title="Manual APY"
                    textSize="xsmall"
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                    data={[{ value: '20.00%', textSize: 'xsmall' }]}
                  />
                  <InfoPanelItem
                    title="Auto APY"
                    textSize="xsmall"
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                    data={[{ value: '20.00%', textSize: 'xsmall' }]}
                  />
                  <PrimaryBtn
                    margin={{ top: 'small' }}
                    pad={'xsmall'}
                    round="large"
                    height={'30px'}
                    text={grants && grants.grantsExist ? 'Disable Auto-compound' : 'Auto-compound'}
                    textSize={grants && grants.grantsExist ? 'xsmall' : 'small'}
                    disabled={!restakePossible}
                    onClick={() => grants && autoCompound(validator, grants)}
                  />
                </Box>
              </Box>
            </Box>
            <Box
              border={{ size: '1px', color: 'clrBoxBorder' }}
              round="xsmall"
              background="clrModalBackground"
              pad={'small'}
              width={'40%'}
            >
              <Text margin={{ bottom: 'small' }} size="small" color={'clrTextPrimary'}>
                VALIDATOR DETAILS
              </Text>
              <InfoPanelItem
                title="Website"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: validator.description.website || '–', textSize: 'xsmall' }]}
              />
              <InfoPanelItem
                title="Address"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: truncate(validator.operator_address, 12, 6), textSize: 'xsmall' }]}
              />
              <InfoPanelItem
                title="Total Staked"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[
                  {
                    value: Number(
                      Math.round(bigNumberToNumber(BigNumber.from(validator.tokens), tokenDecimals)),
                    ).toLocaleString(),
                    textSize: 'xsmall',
                  },
                ]}
              />
              <InfoPanelItem
                title="Voting Participation"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: '', textSize: 'xsmall' }]}
              />
              <InfoPanelItem
                title="Validator Since"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: '', textSize: 'xsmall' }]}
              />
              <InfoPanelItem
                title="Commission Rate"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: `${commissionRate(validator.commission_rates.rate)}%`, textSize: 'xsmall' }]}
              />
              <InfoPanelItem
                title="Max Commission Rate"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: `${commissionRate(validator.commission_rates.max_rate)}%`, textSize: 'xsmall' }]}
              />
              <InfoPanelItem
                title="Max Commission Change"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[
                  {
                    value: `${commissionRate(validator.commission_rates.max_change_rate)}%`,
                    textSize: 'xsmall',
                  },
                ]}
              />
              <InfoPanelItem
                title="Last Commission Change"
                textSize="xsmall"
                justify="between"
                style={InfoPanelItemStyles.Horizontal}
                data={[{ value: getTimePassed(validator.last_commission_update), textSize: 'xsmall' }]}
              />
            </Box>
          </Box>
        </>
      )}
    </Modal>
  )
}

export default ValidatorDetail

import React, { useState, MouseEvent, useEffect, useMemo } from 'react'
import { Box, Text, TextInput } from 'grommet'
import ValidatorLogo from '../ValidatorLogo'
import Modal from 'components/common/Modals/Modal'
import { useStore } from 'api/cosmosStores'
import { BigNumber } from 'ethers'
import { TxnAmountInput } from 'components/Transactions/TxnAmountInput'
import { AvailableToTxnInformationRow, PrimaryBtn } from 'components/common'
import { displayToast, TToastType } from 'components/common/toasts'
import { ETxnSteps } from 'lib/types'
import { TxnConfirm } from 'components/Transactions'
import { MenuItem } from '../DelegationList'
import { Validator } from 'api/stake/data'
import { CaretDownFill } from 'grommet-icons'
import { useStake } from 'api/stake'

interface ReDelegateProps {
  validator: Validator;
  onClose: () => void;
}

const tokenDecimals = BigNumber.from('6')

const ReDelegate = ({ validator, onClose }: ReDelegateProps) => {
  const { Delegations } = useStake()
  const [txnAmount, setTxnAmount] = useState<string>('')
  const { accountStore, chainStore } = useStore()
  const account = accountStore.getAccount('umee-1')
  const [step, setStep] = useState<ETxnSteps>(ETxnSteps.Input)
  const [dstValidator, setDstValidator] = useState<Validator>()
  const [isOpenMenu, setIsOpenMenu] = useState<Boolean>(false)
  const { Validators } = useStake()
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchedValidators, setSearchedValidators] = useState<Validator[] | undefined>(Validators)

  const availableAmount = useMemo(() => {
    let amount = BigNumber.from(0)

    if(Delegations) {
      const delegation = Delegations.find(delegation => delegation.validator_address === validator.operator_address)
      if(delegation) {
        const balance = typeof delegation.balance === 'string' ? delegation.balance : delegation.balance.amount
        return BigNumber.from(balance)
      }
    } 

    return amount
  }, [Delegations, validator.operator_address])
  const srcValidator = validator

  useEffect(() => {
    if (!isOpenMenu) {
      setSearchedValidators(Validators)
      if (searchValue) setSearchValue('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenMenu])

  useEffect(() => {
    if (!Validators) return
    if (searchValue) {
      setSearchedValidators(
        Validators.filter((validator) => {
          const title = validator.moniker
          if (title.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) > -1) return true
        })
      )
    } else setSearchedValidators(Validators)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const reDelegate = async () => {
    if (!txnAmount || !srcValidator || !dstValidator) return
    setStep(ETxnSteps.Pending)

    try {
      await account.cosmos.sendBeginRedelegateMsg(
        txnAmount.toString(),
        srcValidator.operator_address,
        dstValidator.operator_address,
        '',
        undefined,
        undefined,
        {
          onBroadcasted: (txHash: Uint8Array) => {
            displayToast('Redelegating', TToastType.TX_BROADCASTING)
          },
          onFulfill: (tx) => {
            if (!tx.code) {
              displayToast('Redelegate Successful', TToastType.TX_SUCCESSFUL, {
                customLink: chainStore
                  .getChain('umee-1')
                  .raw.explorerUrlToTx.replace('{txHash}', tx.hash.toUpperCase()),
              })
              setStep(ETxnSteps.Input)
            }
          },
        }
      )
    } catch (e) {
      console.log(e)
    }

    onClose()
  }

  return (
    <Modal onClose={onClose} className={`delegate-modal ${isOpenMenu && 'redelegate-modal'}`}>
      {srcValidator && (
        <Box direction="row" justify="between">
          <ValidatorLogo
            title={srcValidator.moniker}
            imgUrl={srcValidator.img_url}
            width="45px"
            height="45px"
            fontFamily="Moret"
            textSize="24px"
            color="white"
          />
        </Box>
      )}
      <Box
        border={{ size: '1px', color: 'clrBoxBorder' }}
        margin={{ top: 'small' }}
        round="xsmall"
        background="clrModalBackground"
      >
        {step === ETxnSteps.Pending ? (
          <Box pad={{ vertical: 'medium' }}>
            <TxnConfirm wallet="Keplr" />
          </Box>
        ) : (
          <>
            <Box pad={{ vertical: 'small', horizontal: 'medium' }}>
              <Text size="xsmall" color={'clrTextPrimary'} className="letter-spacing">
                REDELEGATE TO:
              </Text>
              <Box margin={{ top: 'small' }} style={{ position: 'relative' }}>
                <Box
                  hoverIndicator={false}
                  focusIndicator={false}
                  direction="row"
                  justify="center"
                  align="center"
                  pad={'small'}
                  background={isOpenMenu ? 'clrBorderGrey' : ''}
                  border={{ size: '1px', color: 'clrBorder' }}
                  round="xsmall"
                  onClick={() => setIsOpenMenu(!isOpenMenu)}
                >
                  {dstValidator ? (
                    <ValidatorLogo title={dstValidator.moniker} imgUrl={dstValidator.img_url} />
                  ) : (
                    <Text size="small" color={'clrTextPrimary'}>
                      Select Validator
                    </Text>
                  )}
                  <CaretDownFill color="clrTextPrimary" />
                </Box>
                {Validators && (
                  <Box
                    border={{ size: '1px', color: 'clrBorder' }}
                    round="xsmall"
                    width="100%"
                    className={`validators-list ${isOpenMenu ? 'open' : ''}`}
                    background="clrModalBackground"
                  >
                    <Box pad={'small'}>
                      <Box round="xsmall" background={'clrBorderGrey'}>
                        <TextInput
                          color="clrTextPrimary"
                          placeholder="Search..."
                          className="validator-search letter-spacing"
                          size="xsmall"
                          value={searchValue}
                          onChange={(e) => {
                            e.stopPropagation()
                            setSearchValue(e.target.value)
                          }}
                          autoFocus
                        />
                      </Box>
                    </Box>
                    {searchedValidators && (
                      <Box className="validators">
                        {searchedValidators.length > 0 ? (
                          searchedValidators.map(
                            (validator, index) =>
                              validator.operator_address !== srcValidator?.operator_address && (
                                <MenuItem
                                  border={{
                                    color: 'clrBorderGrey',
                                    side: 'top',
                                    size: '1px',
                                  }}
                                  key={index}
                                  menu={<ValidatorLogo title={validator.moniker} imgUrl={validator.img_url} />}
                                  onClick={(e: MouseEvent) => {
                                    e.stopPropagation()
                                    setDstValidator(validator)
                                    setIsOpenMenu(false)
                                  }}
                                />
                              )
                          )
                        ) : (
                          <Box pad={'small'}>
                            <Text size="small" color={'clrTextPrimary'}>
                              No validators found
                            </Text>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            {dstValidator && (
              <Box
                pad={{ vertical: 'small', horizontal: 'medium' }}
                border={{ side: 'top', size: '1px', color: 'clrButtonBorderGrey' }}
              >
                <AvailableToTxnInformationRow
                  symbol="UMEE"
                  wallet={true}
                  availableAmount={availableAmount}
                  tokenDecimals={tokenDecimals}
                />
                <TxnAmountInput
                  txnAmount={txnAmount}
                  txnAvailability={{
                    tokenDecimals: tokenDecimals,
                    availableAmount: availableAmount,
                    token: { symbol: 'UMEE' },
                  }}
                  setTxnAmount={setTxnAmount}
                  isRangeInput={false}
                />
                <PrimaryBtn
                  text="Redelegate"
                  fullWidth
                  pad={{ vertical: 'small' }}
                  textSize="medium"
                  round="large"
                  margin={{ top: 'medium' }}
                  disabled={Number(txnAmount) === 0}
                  onClick={() => reDelegate()}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Modal>
  )
}

export default ReDelegate

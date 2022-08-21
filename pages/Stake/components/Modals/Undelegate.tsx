import React, { useMemo, useState } from 'react'
import { Box, Text } from 'grommet'
import ValidatorLogo from '../ValidatorLogo'
import Modal from 'components/common/Modals/Modal'
import { useStore } from 'api/cosmosStores'
import { BigNumber } from 'ethers'
import { TxnAmountInput } from 'components/Transactions/TxnAmountInput'
import { AvailableToTxnInformationRow, PrimaryBtn } from 'components/common'
import { displayToast, TToastType } from 'components/common/toasts'
import { ETxnSteps } from 'lib/types'
import { TxnConfirm } from 'components/Transactions'
import { Validator } from 'api/stake/data'
import { useStake } from 'api/stake'

interface UnDelegateProps {
  validator: Validator;
  onClose: () => void;
}

const tokenDecimals = BigNumber.from('6')

const UnDelegate = ({ validator, onClose }: UnDelegateProps) => {
  const { Delegations } = useStake()
  const [txnAmount, setTxnAmount] = useState<string>('')
  const { accountStore, chainStore } = useStore()
  const account = accountStore.getAccount('umee-1')
  const [step, setStep] = useState<ETxnSteps>(ETxnSteps.Input)
  
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

  const unDelegate = async () => {
    if (!txnAmount || !validator) return
    setStep(ETxnSteps.Pending)

    try {
      await account.cosmos.sendUndelegateMsg(
        txnAmount.toString(),
        validator.operator_address,
        '',
        undefined,
        undefined,
        {
          onBroadcasted: (txHash: Uint8Array) => {
            displayToast('Undelegating', TToastType.TX_BROADCASTING)
          },
          onFulfill: (tx) => {
            if (!tx.code) {
              displayToast('Undelegate Successful', TToastType.TX_SUCCESSFUL, {
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
    <Modal onClose={onClose} className="delegate-modal">
      {validator && (
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
              <Text size="small" color={'clrTextPrimary'}>
                Once the unbonding period begins you will:
              </Text>
              <Text margin={{ top: 'small' }} size="small" color={'clrTextPrimary'}>
                <div style={{ lineHeight: '144.5%' }}>
                  - not receive staking rewards
                  <br /> - not be able to cancel the unbonding
                  <br /> - need to wait 14 days for the amount to be liquid
                </div>
              </Text>
            </Box>
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
                text="Undelegate"
                fullWidth
                pad={{ vertical: 'small' }}
                textSize="medium"
                round="large"
                margin={{ top: 'medium' }}
                disabled={Number(txnAmount) === 0}
                onClick={() => unDelegate()}
              />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  )
}

export default UnDelegate

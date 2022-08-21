import React, { useState, useMemo, useEffect, useCallback, useContext } from 'react'
import { Box, Text, Image, TextInput, ResponsiveContext } from 'grommet'
import { TxnAmountContainer, TxnConfirm } from 'components/Transactions'
import TokenLogo from 'components/TokenLogo'
import { AvailableToTxnInformationRow, TxnAmountInputRow } from 'components/Transactions'
import { TTxnAvailability, ETxnType, ETxnSteps, ITokenData } from 'lib/types'
import truncate from 'lib/truncate'
import { useAccountConnection } from 'api/cosmosStores/account-init-management'
import { BaseTab } from 'components/Transactions/TxnTabs'
import { utils } from 'ethers'
import { suggestedFee } from 'dialogs/Bridge'
import { Chain, useChain } from 'lib/hooks/chain/context'
import GradientBox from 'components/common/GradientBox/GradientBox'
import TransactionContainer from 'components/TransactionsMobile/TransactionContainer'

enum Steps {
  Input,
  Pending,
  Final,
}

interface BridgeInputProps {
  txnAvailability: TTxnAvailability;
  handleContinue: (amount: number, fee: number) => (e: React.MouseEvent) => void;
  onTabChange: (activeTab: ETxnType) => void;
  txnType: ETxnType;
  txnStep: ETxnSteps;
  depositTab: string;
  withdrawTab: string;
  layers: { address: string; logo: string }[];
  defaultFeeAmount: number;
  suggestedFees: suggestedFee[];
}

const BridgeInputAmount: React.FC<BridgeInputProps> = ({
  txnAvailability,
  handleContinue,
  onTabChange,
  txnType,
  txnStep,
  depositTab,
  withdrawTab,
  layers,
  defaultFeeAmount,
  suggestedFees,
}) => {
  const [amount, setAmount] = useState('')
  const { chainMode } = useChain()

  const { isAccountConnected } = useAccountConnection()

  const [preview, setPreview] = useState<boolean>(false)

  const [feeAmount, setFeeAmount] = useState(0)

  const [editFeeAmount, setEditFeeAmount] = useState(false)

  const size = useContext(ResponsiveContext)

  useEffect(() => setFeeAmount(defaultFeeAmount), [defaultFeeAmount])

  const { token, availableAmount, tokenDecimals } = txnAvailability

  // max balance that can transfer which excludes bridge fee
  const txnMaxAvail = {
    ...txnAvailability,
    availableAmount:
      parseFloat(utils.formatUnits(availableAmount, tokenDecimals)) > 0.01
        ? availableAmount.sub(10000)
        : availableAmount,
  }

  const step = useMemo(() => {
    if (txnStep === ETxnSteps.Pending || txnStep === ETxnSteps.PendingApprove || txnStep === ETxnSteps.PendingSubmit) {
      return Steps.Pending
    } else if (txnStep === ETxnSteps.Failure || txnStep === ETxnSteps.Success) {
      return Steps.Final
    } else {
      return Steps.Input
    }
  }, [txnStep])

  const layerInfo = useMemo(
    () => [
      <>
        <TokenLogo src={layers[0].logo} width="36" height="36" />
        <Text color="clrTextPrimary" margin={{ left: 'small' }} size="small" title={layers[0].address}>
          {isAccountConnected && truncate(layers[0].address, 25, 4)}
        </Text>
      </>,
      <>
        <Image alt="symbol" src={layers[1].logo} width="36" height="36" />
        <Text color="clrTextPrimary" margin={{ left: 'small' }} size="small" title={layers[1].address}>
          {truncate(layers[1].address, 23, 4)}
        </Text>
      </>,
    ],
    [isAccountConnected, layers]
  )

  useEffect(() => {
    setAmount('')
  }, [txnType])

  const handleFeeCancelClick = useCallback(() => {
    setEditFeeAmount(false)
    setFeeAmount(defaultFeeAmount)
  }, [defaultFeeAmount])

  const handleFeeOkayClick = useCallback(() => {
    setFeeAmount(() => {
      const v = Number(feeAmount)
      if (isNaN(v) || v > 0) {
        return v
      } else {
        return defaultFeeAmount
      }
    })
    setEditFeeAmount(false)
  }, [defaultFeeAmount, feeAmount])

  if (size === 'small') {
    return (
      <TransactionContainer
        onClose={() => {}}
        symbol={token.symbol}
        logo={token.logo}
        bridge
        txnType={ETxnType.transfer}
        withdrawModal={false}
        availableAmount={txnMaxAvail.availableAmount}
        tokenDecimals={tokenDecimals}
        txnAmount={amount}
        txnAvailability={txnAvailability}
        setTxnAmount={setAmount}
        setIsPreview={setPreview}
        isPreview={preview}
        handleContinue={handleContinue(Number(amount), feeAmount)}
        isPending={step === Steps.Pending}
        isFinal={step === Steps.Final}
      >
        <Text color='clrTextPrimary' size='small'>
          From
        </Text>
        <GradientBox pad='.5em' margin={{ top: 'xsmall' }}>
          <Box direction="row" justify="start" align="center">
            {layerInfo[txnType === ETxnType.deposit ? 0 : 1]}
          </Box>
        </GradientBox>
        <Text color='clrTextPrimary' size='small' margin={{ top: 'small'}}>
          To
        </Text>
        <GradientBox pad='.5em' margin={{ top: 'xsmall' }}>
          <Box direction="row" justify="start" align="center">
            {layerInfo[txnType === ETxnType.withdraw ? 0 : 1]}
          </Box>
        </GradientBox>
        {txnType === ETxnType.deposit && (
          <>
            <Box
              border={{ size: '1px', color: 'clrBorderGrey', side: 'top' }}
              margin={{ vertical: 'large', horizontal: '-24px'}}
              style={{ maxWidth: 'none' }}
            />
            <FeeConfig
              setFeeAmount={setFeeAmount}
              feeAmount={feeAmount}
              editFeeAmount={editFeeAmount}
              token={token}
              suggestedFees={suggestedFees}
            />
          </>
        )}
      </TransactionContainer>
    )
  }

  if (step !== Steps.Input) {
    return (
      <TxnAmountContainer>
        {step === Steps.Pending && <TxnConfirm wallet={txnType === ETxnType.deposit ? 'Keplr' : 'Metamask'} />}
      </TxnAmountContainer>
    )
  }

  return (
    <TxnAmountContainer
      txnType={txnType}
      bridge={true}
      handleContinue={handleContinue(Number(amount), feeAmount)}
      buttonDisabled={Number(amount) === 0 || editFeeAmount}
      header={
        <BaseTab
          choiceA={chainMode === Chain.cosmos ? withdrawTab : depositTab}
          choiceB={chainMode === Chain.cosmos ? depositTab : withdrawTab}
          defaultSelected={chainMode === Chain.cosmos ? txnType === ETxnType.withdraw : txnType === ETxnType.deposit}
          handler={() => onTabChange(txnType === ETxnType.deposit ? ETxnType.withdraw : ETxnType.deposit)}
          margin={{ top: 'medium' }}
        />
      }
    >
      <Box pad={{ horizontal: 'medium' }}>
        <AvailableToTxnInformationRow
          txnType={txnType}
          symbol={token.symbol ?? ''}
          availableAmount={availableAmount}
          tokenDecimals={tokenDecimals}
          bridge={true}
        />
        <TxnAmountInputRow txnAvailability={txnMaxAvail} setTxnAmount={setAmount} txnAmount={amount} />
      </Box>
      <Box
        border={{ size: '1px', color: 'clrBorderGrey', side: 'top' }}
        pad={{ horizontal: 'medium', top: 'medium' }}
      >
        <Text color="clrTextPrimary" size="xsmall" className="letter-spacing">
          From
        </Text>
        <Box pad={{ vertical: 'small' }} width="100%" direction="row" justify="between" align="center">
          <Box direction="row" justify="start" align="center">
            {layerInfo[txnType === ETxnType.deposit ? 0 : 1]}
          </Box>
        </Box>
        <Box pad={{ top: 'small' }}>
          <Text color="clrTextPrimary" size="xsmall" className="letter-spacing">
            To
          </Text>
          <Box pad={{ vertical: 'small' }} width="100%" direction="row" align="center">
            {layerInfo[txnType === ETxnType.withdraw ? 0 : 1]}
          </Box>
        </Box>
      </Box>
      {txnType === ETxnType.deposit && (
        <Box
          border={{ size: '1px', color: 'clrBorderGrey', side: 'top' }}
          pad={{ horizontal: 'medium', top: 'small' }}
        >
          <FeeConfig
            setFeeAmount={setFeeAmount}
            feeAmount={feeAmount}
            editFeeAmount={editFeeAmount}
            token={token}
            suggestedFees={suggestedFees}
          />
        </Box>
      )}
    </TxnAmountContainer>
  )
}

interface FeeConfigProps {
  setFeeAmount: (val: number) => void
  feeAmount: number
  editFeeAmount: boolean
  token: ITokenData
  suggestedFees: suggestedFee[]
}

const FeeConfig = ({
  setFeeAmount,
  feeAmount,
  editFeeAmount,
  token,
  suggestedFees,
}: FeeConfigProps) => (
  <Box>
    <Text color="clrTextPrimary" size="xsmall" className="letter-spacing">
      BRIDGE FEE
    </Text>
    <Box pad={{ top: 'small' }} direction="row" align="center" justify="between">
      <Text color="clrTextPrimary" size="small">
        Suggested fee
      </Text>
      <Box direction="row" align="center" justify="between">
        {editFeeAmount ? (
          <TextInput
            color="clrTextPrimary"
            autoFocus
            style={{
              borderStyle: 'none',
              width: '6em',
              maxWidth: '6em',
              fontSize: '15px',
              fontWeight: 'normal',
              textAlign: 'right',
              padding: 0,
            }}
            onChange={(e: any) => setFeeAmount(e.target.value)}
            value={feeAmount}
            type="number"
            min="0"
          />
        ) : (
          <Text color="clrTextPrimary" size="small">
            {feeAmount}
          </Text>
        )}
        <Text color="clrTextPrimary" size="small" style={{ paddingLeft: 5 }}>
          {token.symbol}
        </Text>
      </Box>
    </Box>
    <Box margin={{ top: 'medium' }} direction="row" gap="0" flex>
      {suggestedFees.map((fee, index) => (
        <Box
          key={index}
          direction="row"
          justify="center"
          align="center"
          background={feeAmount === fee.value ? 'clrBoxGradient' : 'clrBorderGrey'}
          pad="small"
          flex
          onClick={() => setFeeAmount(fee.value)}
        >
          <Box>
            <Text color="clrPrimary" size="small" alignSelf="center" weight="bold">
              {fee.label}
            </Text>
            <Text color="clrPrimary" margin={{ top: 'xsmall' }} size="xsmall" alignSelf="center">
              {fee.value} {token.symbol}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
)

export default BridgeInputAmount

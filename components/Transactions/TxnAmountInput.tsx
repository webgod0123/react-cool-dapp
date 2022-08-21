import React from 'react'
import { Box, Text, TextInput } from 'grommet'
import { utils } from 'ethers'
import { TTxnAvailability } from 'lib/types'
import { MaxBtn } from 'components/common'
import TxnAmountRangeInput from './TxnAmountRangeInput'
import { truncateAfterDecimals } from 'lib/number-utils'
import { TxnUsdPrice } from './TxnUsdPrice'

interface TTxnAmountInput {
  setTxnAmount: (amount: string) => void
  txnAvailability: TTxnAvailability
  disabled?: boolean
  txnAmount: string
  isRangeInput?: boolean
}

const scales = [0, 1, 2, 3, 4]

export const TxnAmountInput: React.FC<TTxnAmountInput> = ({
  setTxnAmount,
  disabled,
  txnAvailability,
  txnAmount,
  isRangeInput = true,
}) => {
  const { availableAmount, token, tokenDecimals } = txnAvailability
  const maxAmount = utils.formatUnits(availableAmount, tokenDecimals)
  const truncatedValue = truncateAfterDecimals(txnAmount, 6)

  return (
    <>
      <Box
        direction="row"
        margin={{ top: 'xsmall', bottom: 'small' }}
        align="end"
        focusIndicator={true}
        justify="between"
      >
        <Box>
          <Box direction="row" justify="start" align="center" pad={{ top: 'xsmall' }}>
            <TextInput
              color="clrTextPrimary"
              style={{
                borderStyle: 'none',
                width: `${truncatedValue.toString().length}ch`,
                fontSize: '20px',
                minWidth: '40px',
                padding: 0,
                fontWeight: 'normal',
                maxWidth: '200px',
              }}
              onChange={function (e: any) {
                e.currentTarget.value = e.currentTarget.value.replace(/^0+(?=\d)/, '')
                setTxnAmount(
                  Math.max(
                    Math.min(truncateAfterDecimals(e.currentTarget.value, Number(tokenDecimals)), Number(maxAmount)),
                    0,
                  ).toString(),
                )
              }}
              value={txnAmount && truncatedValue}
              placeholder="0.00"
              type="number"
              min="0"
              disabled={disabled}
            />
            <Text color="clrTextPrimary" alignSelf="center" margin={{ left: 'xxsmall' }} size="medium">
              {token.symbol == 'WETH' ? 'ETH' : token.symbol}
            </Text>
          </Box>
          <Box>
            <TxnUsdPrice symbol={token.symbol} txnAmount={txnAmount} />
          </Box>
        </Box>
        <Box>
          <MaxBtn
            txnAvailability={txnAvailability}
            onClickCb={(amount: string) => setTxnAmount(Number(amount) > 0 ? amount : '0')}
          />
        </Box>
      </Box>
      {isRangeInput && (
        <TxnAmountRangeInput
          value={Number(maxAmount) > 0 ? Math.min(Math.round((Number(txnAmount) * 100) / Number(maxAmount)), 100) : 0}
          min={0}
          max={100}
          setValue={(value: any) =>
            setTxnAmount(
              value === '100' ? maxAmount : utils.formatUnits(availableAmount.mul(value).div(100), tokenDecimals),
            )
          }
          scales={scales}
          maxAmount={maxAmount}
        />
      )}
    </>
  )
}

TxnAmountInput.defaultProps = {
  disabled: false,
}

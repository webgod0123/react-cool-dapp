import * as React from 'react'
import { DataList, DataListRow, PrimaryText, SubText, TextItem, TokenItem } from 'components/DataList'
import { IDataListColumn } from 'components/DataList/DataList'
import { BigNumber, utils } from 'ethers'
import { ETxnType, IUserTxnBorrow } from 'lib/types'
import { bigNumberToString, bigNumberToUSDString } from 'lib/number-utils'
import { Box, ResponsiveContext, Text } from 'grommet'
import { SecondaryBtn } from 'components/common'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { AssetCard } from 'components/AssetCard/AssetCard'
import abbreviateNumber from 'lib/abbreviate'

export interface BorrowsDataListProps {
  columns: IDataListColumn[]
  data: IUserTxnBorrow[]
  onSelect: (symbol: string, modalShow: ETxnType, address: string, logo?: string) => void
}

const BorrowsDataList = ({ columns, data, onSelect }: BorrowsDataListProps) => {
  const aprDecimals = BigNumber.from(25)
  const columnSizes = columns.map((col) => col.size)
  const size = React.useContext(ResponsiveContext)
  const { chainMode } = useChain()

  return (
    <Box>
      <DataList columns={columns} title={{ title: 'Borrow' }}>
        {data.length > 0 ? (
          <Box>
            {data.map((row) => {
              const { symbol, currentVariableDebt, variableBorrowAPR, decimals, address, usdPrice, chain, logo } = row
              const balance = Number(bigNumberToString(currentVariableDebt ?? 0, decimals))
              const balanceUsd = Number(bigNumberToUSDString(currentVariableDebt ?? 0, decimals, usdPrice))
              const apy =
                variableBorrowAPR &&
                (chainMode == Chain.ethereum
                  ? parseFloat(utils.formatUnits(variableBorrowAPR, aprDecimals)).toFixed(2)
                  : variableBorrowAPR)

              if (size === 'small') {
                return (
                  <Box className="asset-card" key={`row-${symbol}-3`}>
                    <AssetCard
                      symbol={symbol ?? ''}
                      logo={logo}
                      values={[
                        { label: 'borrowed', value: abbreviateNumber(balance) },
                        { label: chainMode === Chain.cosmos ? 'APR' : 'APY', value: `${apy}%`, color: 'clrBorrowText' },
                      ]}
                      noGradient={false}
                      chainName={chain}
                      onClick={() => onSelect(symbol, ETxnType.borrow, address, logo)}
                    />
                  </Box>
                )
              }
              return (
                <DataListRow columnSizes={columnSizes} key={`row-${symbol}-2`}>
                  {symbol && <TokenItem logo={logo} textSize="small" symbol={symbol} chain={chain} />}
                  <TextItem align="end" direction="column">
                    <PrimaryText color="clrTextPrimary" size="small">
                      ${balanceUsd.toLocaleString()}
                    </PrimaryText>
                    <SubText margin={{ top: 'xxsmall' }} size="xsmall" color={'clrTextSecondary'}>
                      {balance.toLocaleString()} {symbol}
                    </SubText>
                  </TextItem>
                  <TextItem justify="end">
                    <PrimaryText color="clrBorrowText" size="small">
                      {apy}%
                    </PrimaryText>
                  </TextItem>
                  {address && (
                    <TextItem justify="end">
                      <SecondaryBtn
                        round="large"
                        text="Manage"
                        pad={{ vertical: 'small', horizontal: 'small' }}
                        textSize="xsmall"
                        onClick={() => onSelect(symbol, ETxnType.borrow, address, logo)}
                      />
                    </TextItem>
                  )}
                </DataListRow>
              )
            })}
          </Box>
        ) : (
          <Text margin={{ top: 'small' }} size="small" color="clrTextPrimary">
            Nothing borrowed yet
          </Text>
        )}
      </DataList>
    </Box>
  )
}

export default BorrowsDataList

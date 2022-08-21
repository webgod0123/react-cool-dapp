import React, { useContext } from 'react'
import { DataList, DataListRow, PrimaryText, SubText, TextItem, TokenItem } from 'components/DataList'
import { IDataListColumn } from 'components/DataList/DataList'
import { BigNumber, utils } from 'ethers'
import { Box, GridSizeType, ResponsiveContext, Text } from 'grommet'
import { ETxnType, IUserTxnDeposit } from 'lib/types'
import { bigNumberToString, bigNumberToUSDString } from 'lib/number-utils'
import { SecondaryBtn } from 'components/common'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { AssetCard } from 'components/AssetCard/AssetCard'
import abbreviateNumber from 'lib/abbreviate'

export interface DepositsDataListProps {
  columns: IDataListColumn[]
  data: IUserTxnDeposit[]
  onSelect: (symbol: string, modalShow: ETxnType, address: string, logo?: string) => void
}

const DepositsDataList = ({ columns, data, onSelect }: DepositsDataListProps) => {
  return (
    <Box>
      <DataList columns={columns} title={{ title: 'Supply' }}>
        {data.length > 0 ? (
          data.map((row) => (
            <Row
              key={row.address}
              onClick={(symbol, address, logo) => onSelect(symbol, ETxnType.deposit, address, logo)}
              columnSizes={columns.map((col) => col.size)}
              row={row}
            />
          ))
        ) : (
          <Text margin={{ top: 'small' }} size="small" color="clrTextPrimary">
            Nothing supplied yet
          </Text>
        )}
      </DataList>
    </Box>
  )
}

const Row = ({
  columnSizes,
  row,
  onClick,
}: {
  columnSizes: GridSizeType[]
  row: IUserTxnDeposit
  onClick: (symbol: string, address: string, logo?: string) => void
}) => {
  const size = useContext(ResponsiveContext)
  const { chainMode } = useChain()
  const { symbol, currentUTokenBalance, liquidityRate, address, decimals, usdPrice, chain, logo } = row
  const balance = Number(bigNumberToString(currentUTokenBalance ?? 0, decimals))
  const balanceUsd = bigNumberToUSDString(currentUTokenBalance ?? 0, decimals, usdPrice)
  const apy =
    liquidityRate &&
    (chainMode == Chain.ethereum
      ? parseFloat(utils.formatUnits(liquidityRate, BigNumber.from(25))).toFixed(2)
      : liquidityRate)

  if (size === 'small') {
    return (
      <Box className="asset-card">
        <AssetCard
          symbol={symbol}
          noGradient={false}
          logo={logo}
          chainName={chain}
          onClick={() => onClick(symbol, address, logo)}
          values={[
            { label: 'supplied', value: abbreviateNumber(balance) },
            { label: chainMode === Chain.cosmos ? 'APR' : 'APY', value: `${apy}%`, color: 'clrSupplyText' },
          ]}
        />
      </Box>
    )
  }

  return (
    <DataListRow columnSizes={columnSizes}>
      {symbol && <TokenItem logo={logo} textSize="small" symbol={symbol} chain={chain} />}
      <TextItem align="end" direction="column">
        <PrimaryText color="clrTextPrimary" size="small">
          ${Number(balanceUsd).toLocaleString()}
        </PrimaryText>
        <SubText margin={{ top: 'xxsmall' }} size="xsmall" color={'clrTextSecondary'}>
          {balance.toLocaleString()} {symbol}
        </SubText>
      </TextItem>
      <TextItem justify="end">
        <PrimaryText color="clrSupplyText" size="small">
          {apy}%
        </PrimaryText>
      </TextItem>
      {address && (
        <TextItem justify="end">
          <SecondaryBtn
            textSize="xsmall"
            round="large"
            text="Manage"
            pad={{ vertical: 'small', horizontal: 'small' }}
            onClick={() => onClick(symbol, address, logo)}
          />
        </TextItem>
      )}
    </DataListRow>
  )
}

export default DepositsDataList

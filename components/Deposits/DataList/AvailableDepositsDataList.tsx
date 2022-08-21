import React, { useContext, useState, MouseEvent } from 'react'
import { Box, GridSizeType, ResponsiveContext, Text } from 'grommet'
import { DataList, DataListRow, PrimaryText, SubText, TextItem, TokenItem } from 'components/DataList'
import { IDataListColumn } from 'components/DataList/DataList'
import { BigNumber } from 'ethers'
import { bigNumberToString } from 'lib/number-utils'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { AssetCard } from 'components/AssetCard/AssetCard'
import GradientBox from 'components/common/GradientBox/GradientBox'
import orderBy from 'lodash/fp/orderBy'
import abbreviateNumber from 'lib/abbreviate'
import { UsdPrice } from 'components/common/UsdPrice'
import { SecondaryBtn } from 'components/common'
import { ETxnType } from 'lib/types'

export interface IAvailableDepositsData {
  address: string
  symbol: string
  color?: string
  tokenBalance?: BigNumber
  usdBalance?: BigNumber
  usdPriceDecimals?: number
  apy?: string
  decimals: number
  usageAsCollateralEnabled?: boolean
  chain?: string
  logo?: string
}

export interface AvailableDepositsDataListProps {
  columns: IDataListColumn[]
  data: IAvailableDepositsData[]
  selectedTokenAddress?: string
  onSelect: (symbol: string, modalShow: ETxnType, address: string, logo?: string) => void
}

interface RowProps {
  row: IAvailableDepositsData
  columnSizes: GridSizeType[]
  onSelect?: () => void
  available?: boolean
  guest?: boolean
  onCollateralClick?: (e: MouseEvent) => void
  isSupplied?: boolean
}

const Row = ({ columnSizes, row, available, onSelect, isSupplied }: RowProps) => {
  const size = useContext(ResponsiveContext)
  const { chainMode } = useChain()
  const { address, symbol, tokenBalance, apy, decimals, chain, logo } = row
  const balance = Number(bigNumberToString(tokenBalance ?? 0, decimals))

  if (size === 'small') {
    return (
      <Box className="asset-card">
        <AssetCard
          onClick={onSelect}
          symbol={symbol}
          logo={logo}
          chainName={chain}
          noGradient={available || false}
          values={[
            { label: isSupplied ? 'supplied' : 'available', value: abbreviateNumber(balance) },
            { label: chainMode === Chain.cosmos ? 'APR' : 'APY', value: `${apy}%`, color: 'clrSupplyText' },
          ]}
        />
      </Box>
    )
  }

  return (
    <DataListRow columnSizes={columnSizes} tokenAddress={address}>
      <TokenItem logo={logo} textSize="small" symbol={symbol} chain={chain} />
      <TextItem align="end" direction="column">
        <PrimaryText color="clrTextPrimary" size="small">
          <UsdPrice color="clrTextPrimary" symbol={symbol} txnAmount={balance.toString()} />
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
      <TextItem justify="end">
        <SecondaryBtn
          onClick={onSelect}
          textSize="xsmall"
          round="large"
          text="Supply"
          pad={{ vertical: 'small', horizontal: 'small' }}
        />
      </TextItem>
    </DataListRow>
  )
}

const AvailableDepositsDataList = ({ columns, data, onSelect }: AvailableDepositsDataListProps) => {
  const size = useContext(ResponsiveContext)
  const [availableMarketSort, setAvailableMarketSort] = useState<'popular' | 'apr'>('popular')

  const columnSizes = columns.map((col) => col.size)

  return (
    <Box margin={{ top: 'large' }}>
      {data.length > 0 ? (
        <Box>
          {size === 'small' ? (
            <Text
              color="clrTextPrimary"
              size="medium1"
              textAlign="center"
              margin={{ vertical: 'medium' }}
              style={{ fontFamily: 'Moret' }}
            >
              Other Markets
            </Text>
          ) : (
            <Box pad={{ vertical: 'small' }} className={'border-gradient-bottom'}>
              <Text color="clrTextPrimary" size={'small'}>
                Available Markets
              </Text>
            </Box>
          )}
          {size === 'small' && (
            <Box margin={{ bottom: 'medium' }} flex direction="row">
              <GradientBox
                selected={availableMarketSort === 'popular'}
                onClick={() => setAvailableMarketSort('popular')}
                filter
                margin={{ right: 'small' }}
              >
                <Text size="small" color={'clrTextPrimary'}>
                  Most Popular
                </Text>
              </GradientBox>
              <GradientBox
                selected={availableMarketSort === 'apr'}
                filter
                onClick={() => setAvailableMarketSort('apr')}
              >
                <Text size="small" color={'clrTextPrimary'}>
                  Highest Supply APR
                </Text>
              </GradientBox>
            </Box>
          )}
          <DataList columns={columns}>
            {(size !== 'small' || availableMarketSort === 'popular'
              ? data
              : orderBy(['apy'], ['desc'])(data.map((x) => ({ ...x, apy: Number(x.apy).toFixed(2) })))
            ).map((row: any) => (
              <React.Fragment key={`row-${row.symbol}`}>
                <Row
                  columnSizes={columnSizes}
                  row={{ ...row, apy: Number(row.apy) === 0 ? '0.00' : row.apy }}
                  available
                  onSelect={() => onSelect(row.symbol, ETxnType.deposit, row.address, row.logo)}
                />
              </React.Fragment>
            ))}
          </DataList>
        </Box>
      ) : (
        size === 'small' && (
          <Text size="small" color="clrTextPrimary" textAlign="center">
            No items
          </Text>
        )
      )}
    </Box>
  )
}

export default AvailableDepositsDataList

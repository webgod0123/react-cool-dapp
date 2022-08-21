import * as React from 'react'
import { DataList, DataListRow, PrimaryText, SubText, TextItem, TokenItem } from 'components/DataList'
import { IDataListColumn } from 'components/DataList/DataList'
import { BigNumber } from 'ethers'
import { bigNumberToString } from 'lib/number-utils'
import { Box, GridSizeType, ResponsiveContext, Text } from 'grommet'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { AssetCard } from 'components/AssetCard/AssetCard'
import GradientBox from 'components/common/GradientBox/GradientBox'
import orderBy from 'lodash/fp/orderBy'
import abbreviateNumber from 'lib/abbreviate'
import { UsdPrice } from 'components/common/UsdPrice'
import { SecondaryBtn } from 'components/common'
import { ETxnType } from 'lib/types'

export interface IAvailableBorrowsData {
  address: string
  symbol: string
  color?: string
  tokensAvailable?: BigNumber
  usdAvailable?: number
  variableAPR: string
  stableAPR?: BigNumber
  decimals: number
  borrowingEnabled: boolean
  balance?: number
  chain?: string
  logo?: string
}

export interface AvailableBorrowsDataListProps {
  columns: IDataListColumn[]
  data: IAvailableBorrowsData[]
  onSelect: (symbol: string, modalShow: ETxnType, address: string, logo?: string) => void
}

interface RowProps {
  row: IAvailableBorrowsData
  columnSizes: GridSizeType[]
  balance?: number
  available?: boolean
  onSelect?: () => void
  isBorrowed?: boolean
}

const Row = ({ row, balance, available, columnSizes, onSelect, isBorrowed }: RowProps) => {
  const size = React.useContext(ResponsiveContext)
  const { chainMode } = useChain()

  if (size === 'small') {
    return (
      <Box className="asset-card">
        <AssetCard
          onClick={onSelect}
          symbol={row.symbol}
          logo={row.logo}
          chainName={row.chain}
          noGradient={available || false}
          values={[
            { label: isBorrowed ? 'borrowed' : 'available', value: abbreviateNumber(balance) },
            { label: chainMode === Chain.cosmos ? 'APR' : 'APY', value: `${row.variableAPR}%`, color: 'clrBorrowText' },
          ]}
        />
      </Box>
    )
  }

  return (
    <DataListRow columnSizes={columnSizes} tokenAddress={row.address}>
      <TokenItem logo={row.logo} textSize="small" symbol={row.symbol} chain={row.chain} />
      <TextItem align="end" direction="column">
        <PrimaryText color="clrTextPrimary" size="small">
          <UsdPrice color="clrTextPrimary" symbol={row.symbol} txnAmount={balance?.toString() || '–'} />
        </PrimaryText>
        <SubText margin={{ top: 'xxsmall' }} size="xsmall" color={'clrTextSecondary'}>
          {Number(balance).toLocaleString()} {row.symbol}
        </SubText>
      </TextItem>
      <TextItem justify="end">
        <PrimaryText color="clrBorrowText">{row.borrowingEnabled ? `${row.variableAPR}%` : '–'}</PrimaryText>
      </TextItem>
      <TextItem justify="end">
        <SecondaryBtn
          onClick={onSelect}
          textSize="xsmall"
          round="large"
          text="Borrow"
          pad={{ vertical: 'small', horizontal: 'small' }}
        />
      </TextItem>
    </DataListRow>
  )
}

const AvailableBorrowsDataList = ({ columns, data, onSelect }: AvailableBorrowsDataListProps) => {
  const columnSizes = columns.map((col) => col.size)
  const size = React.useContext(ResponsiveContext)
  const [availableMarketSort, setAvailableMarketSort] = React.useState<'popular' | 'apr'>('popular')

  return (
    <Box margin={{ top: 'large' }}>
      {data && data.length > 0 ? (
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
                margin={{ right: 'small' }}
                filter
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
                  Lowest Borrow APR
                </Text>
              </GradientBox>
            </Box>
          )}
          <DataList columns={columns}>
            {(size !== 'small' || availableMarketSort === 'popular'
              ? data
              : orderBy(
                ['variableAPR'],
                ['asc'],
              )(data.map((x) => ({ ...x, variableAPR: Number(x.variableAPR).toFixed(2) })))
            ).map((row: any) => (
              <React.Fragment key={`row-${row.symbol}`}>
                <Row
                  balance={Number(row.tokensAvailable && bigNumberToString(row.tokensAvailable, row.decimals))}
                  row={{ ...row, variableAPR: Number(row.variableAPR) === 0 ? '0.00' : row.variableAPR }}
                  columnSizes={columnSizes}
                  onSelect={() => onSelect(row.symbol, ETxnType.borrow, row.address, row.logo)}
                  available
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

export default AvailableBorrowsDataList

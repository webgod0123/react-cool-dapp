import React, { useContext, useEffect, useState, useMemo } from 'react'
import { DataList, DataListRow, PrimaryText, SubText, TextItem, TokenItem } from 'components/DataList'
import { IDataListColumn } from 'components/DataList/DataList'
import { BigNumber } from 'ethers'
import BridgeModal from 'components/BridgeTransaction/BridgeModal'
import { bigNumberToString } from 'lib/number-utils'
import abbreviateNumber from 'lib/abbreviate'
import { SecondaryBtn } from 'components/common'
import { ResponsiveContext, Box, Text } from 'grommet'
import { Chain } from 'lib/hooks/chain/context'
import { useData } from 'api/data'
import { useUmeeTokenAddress } from 'api/web3/chains'
import { useWeb3 } from 'api/web3'
import { useAccountConnection } from 'api/cosmosStores/account-init-management'
import { connect } from 'api/web3/providers'
import { Chains } from '../../config'
import InfoTooltip from 'components/common/InfoTooltip/InfoTooltip'
import MarketsDetailDesktop from 'components/Markets/MarketsDetail/MarketsDetailDesktop'
import { ETxnType } from 'lib/types'
import GradientBox from 'components/common/GradientBox/GradientBox'
import TransactionModal from 'components/TransactionsMobile/Transactions'
import { AssetCard } from 'components/AssetCard/AssetCard'
import orderBy from 'lodash/fp/orderBy'
import { TransferDialog } from 'dialogs/Transfer'
import BottomMenus from 'components/common/BottomMenu/BottomMenus'
import Collateral, { CollateralContent } from 'components/DataList/Collateral'
import AssetTooltip from './Tooltips'
import Loading from 'components/common/Loading/Loading'
import styled from '@emotion/styled'

export interface IMarketsData {
  name: string
  address: string
  marketSize?: string
  totalBorrowed?: string
  marketSizeUsd: string
  totalBorrowedUsd: string
  depositAPY: BigNumber | string
  variableBorrowAPR: BigNumber | string
  ltv: BigNumber
  chain?: string
  logo?: string
}

export interface MarketsDataListProps {
  columns: IDataListColumn[]
  data?: IMarketsData[]
  chainType: string
}

const aprDecimals = BigNumber.from(25)

type ModalType = 'menu' | 'markets' | 'bridge' | 'ibc'

export type AssetType = 'collateral' | 'leverage'

const LoaderWrapper = styled.div`
  padding: 1em;
  .loader {
    margin: auto;
  }
`

const MarketsDataList: React.FC<MarketsDataListProps> = ({ columns, data, chainType }) => {
  const size = useContext(ResponsiveContext)
  const [tokenAddress, setTokenAddress] = useState<string>('')
  const [tokenName, setTokenName] = useState<string>('')
  const [tokenLogo, setTokenLogo] = useState<string>('')
  const [isModalShow, setIsModalShow] = useState<ModalType | null>(null)
  const columnSizes = columns.map((col) => col.size)
  const { ReserveData } = useData()
  const { chainId, account } = useWeb3()
  const umeeTokenAddr = useUmeeTokenAddress(chainId)
  const { isAccountConnected, connectAccount } = useAccountConnection()
  const [clickedTxnType, setClickedTxnType] = useState<ETxnType | undefined>()
  const [availableMarketSort, setAvailableMarketSort] = useState<'popular' | 'apr' | 'collateral' | 'leverage'>(
    'popular',
  )
  const [availableMarketFilter, setAvailableMarketFilter] = useState<AssetType[]>(['collateral', 'leverage'])

  const collateralCount = useMemo(() => {
    if (data) {
      const collaterals = data.filter((token) => !token.ltv.isZero())
      return collaterals.length
    }
  }, [data])

  const leverageCount = useMemo(() => {
    if (data) {
      const leverages = data.filter((token) => token.ltv.isZero())
      return leverages.length
    }
  }, [data])

  useEffect(() => {
    if (size === 'small') {
      setAvailableMarketFilter([])
    } else setAvailableMarketFilter(['collateral', 'leverage'])
  }, [size])

  const ethAddress = useMemo(() => {
    const result: any = { UMEE: umeeTokenAddr }
    ReserveData.forEach((acc) => {
      result[acc.symbol] = acc.address
    })
    return result
  }, [umeeTokenAddr, ReserveData])

  const setModalInfo = (name: string, address: any, modal: ModalType, logo?: string) => {
    setTokenAddress(address)
    setTokenName(name)
    setIsModalShow(modal)
    setTokenLogo(logo || '')
  }

  const closeModal = () => setIsModalShow(null)

  const filterAssets = (filter: AssetType) => {
    if (size !== 'small') {
      let filters = [...availableMarketFilter]
      if (filterExist(filter)) {
        filters = filters.filter((data) => data !== filter)
      } else filters.push(filter)
      setAvailableMarketFilter(filters)
    }
  }

  const filterExist = (filter: AssetType) => {
    const filterExist = availableMarketFilter.find((data) => data === filter)
    return !!filterExist
  }

  return (
    <>
      {size !== 'small' && (
        <>
          {isModalShow === 'bridge' && (
            <BridgeModal
              address={tokenAddress}
              tokenName={tokenName}
              logo={tokenLogo}
              onClose={closeModal}
              direction={chainType === Chain.cosmos ? ETxnType.withdraw : ETxnType.deposit}
            />
          )}
          {isModalShow === 'ibc' && (
            <TransferDialog
              onClose={closeModal}
              isMobileView={false}
              chainId={Chains[tokenName]}
              coinMinimalDenom={tokenAddress}
              direction={true}
              logo={tokenLogo}
            />
          )}
          {isModalShow === 'markets' && <MarketsDetailDesktop address={tokenAddress} onClose={closeModal} />}
        </>
      )}
      {size === 'small' && (
        <>
          <BottomMenus
            open={isModalShow === 'menu'}
            symbol={tokenName}
            items={[
              ETxnType.transfer,
              ETxnType.deposit,
              ETxnType.withdraw,
              ETxnType.borrow,
              ETxnType.repay,
              ETxnType.markets,
            ]}
            setOpenSheet={closeModal}
            setSelectedMenu={setClickedTxnType}
          />
          <TransactionModal
            tokenAddress={tokenAddress}
            symbol={tokenName}
            logo={tokenLogo}
            txnType={clickedTxnType}
            onClose={() => setClickedTxnType(undefined)}
          />
        </>
      )}
      {size === 'small' && (
        <Text
          alignSelf="center"
          margin={{ top: 'small', bottom: 'small' }}
          className="font-moret"
          color={'clrTextPrimary'}
          size="medium1"
        >
          Available Assets
        </Text>
      )}

      {size === 'small' && (
        <Box margin={{ top: 'small', bottom: 'small' }} className="markets-filter-list">
          <GradientBox
            margin={{ right: 'small', bottom: 'small' }}
            selected={availableMarketSort === 'popular'}
            onClick={() => setAvailableMarketSort('popular')}
            filter
          >
            <Text size="small" color={'clrTextPrimary'}>
              Most Popular
            </Text>
          </GradientBox>
          <GradientBox
            margin={{ bottom: 'small', right: 'small' }}
            selected={availableMarketSort === 'apr'}
            onClick={() => setAvailableMarketSort('apr')}
            filter
          >
            <Text size="small" color={'clrTextPrimary'}>
              Highest Supply APR
            </Text>
          </GradientBox>
          <GradientBox
            onClick={() => setAvailableMarketSort('collateral')}
            margin={{ right: 'small', bottom: 'small' }}
            selected={size !== 'small' ? filterExist('collateral') : availableMarketSort === 'collateral'}
            filter
          >
            <CollateralContent collateral={true} count={collateralCount} textSize="small" color={'clrTextPrimary'} />
          </GradientBox>
          <GradientBox
            onClick={() => setAvailableMarketSort('leverage')}
            margin={{ bottom: 'small' }}
            selected={size !== 'small' ? filterExist('leverage') : availableMarketSort === 'leverage'}
            filter
          >
            <CollateralContent collateral={false} count={leverageCount} textSize="small" color={'clrTextPrimary'} />
          </GradientBox>
        </Box>
      )}

      <DataList
        background="clrDefaultBg"
        columns={columns}
        title={
          size !== 'small'
            ? {
              title: 'Available Assets',
              children: (
                <Box direction="row">
                  <InfoTooltip content={<AssetTooltip assetType={'collateral'} />}>
                    <Collateral
                      onClick={() => filterAssets('collateral')}
                      filtering
                      margin={{ left: 'xsmall' }}
                      collateral={true}
                      count={collateralCount}
                      selected={filterExist('collateral')}
                    />
                  </InfoTooltip>
                  <InfoTooltip content={<AssetTooltip assetType="leverage" />}>
                    <Collateral
                      onClick={() => filterAssets('leverage')}
                      filtering
                      margin={{ left: 'xsmall' }}
                      collateral={false}
                      count={leverageCount}
                      selected={filterExist('leverage')}
                    />
                  </InfoTooltip>
                </Box>
              ),
            }
            : undefined
        }
      >
        {data ?
          (size !== 'small' || availableMarketSort === 'popular'
            ? data
            : orderBy(
              ['depositAPY'],
              ['desc'],
            )(
              data.map((x) => ({
                ...x,
                depositAPY: Number(x.depositAPY).toFixed(2),
              })),
            )
          ).map(
            ({
              name,
              address,
              marketSizeUsd,
              marketSize,
              depositAPY,
              variableBorrowAPR,
              totalBorrowed,
              totalBorrowedUsd,
              ltv,
              decimals,
              chain,
              logo,
            }: any) => {
              const borrowApy =
                variableBorrowAPR &&
                (chainType == Chain.ethereum ? bigNumberToString(variableBorrowAPR, aprDecimals) : variableBorrowAPR)

              let show
              if (size !== 'small') {
                show = false
                const filterCollateral = filterExist('collateral')
                const filterLeverage = filterExist('leverage')
                if (filterCollateral && filterLeverage) show = true
                if (filterCollateral && !filterLeverage) {
                  if (!ltv.isZero()) show = true
                }
                if (!filterCollateral && filterLeverage) {
                  if (ltv.isZero()) show = true
                }
              } else {
                show = true
                if (availableMarketSort === 'collateral') {
                  if (ltv.isZero()) show = false
                } else if (availableMarketSort === 'leverage') {
                  if (!ltv.isZero()) show = false
                }
              }

              if (show) {
                if (size === 'small') {
                  return (
                    <Box className="asset-card" key={`row-${name}`}>
                      <AssetCard
                        onClick={() => setModalInfo(name, address, 'menu', logo)}
                        symbol={name}
                        chainName={chain}
                        logo={logo}
                        noGradient={false}
                        collateral={!ltv.isZero()}
                        values={[
                          { label: 'supply', value: depositAPY + '%', color: 'clrSupplyText' },
                          { label: 'borrow', value: borrowApy + '%', color: 'clrBorrowText' },
                        ]}
                      />
                    </Box>
                  )
                }

                return (
                  <DataListRow
                    select={() =>
                      !(chainType == Chain.ethereum && name == 'UMEE') && setModalInfo(name, address, 'markets', logo)
                    }
                    columnSizes={columnSizes}
                    tokenAddress={address}
                    key={`row-${name}`}
                  >
                    <TokenItem logo={logo} textSize="small" symbol={name} collateral={!ltv.isZero()} chain={chain} />
                    {size !== 'small' && size !== 'medium' && (
                      <>
                        <TextItem align="end" direction="column">
                          <PrimaryText color="clrTextPrimary" size="small">
                            {`$${
                              chainType == Chain.ethereum
                                ? abbreviateNumber(marketSizeUsd)
                                : abbreviateNumber(Number(marketSizeUsd).toFixed(2))
                            }`}
                          </PrimaryText>
                          <SubText margin={{ top: 'xxsmall' }} size="xsmall" color={'clrTextSecondary'}>
                            {`${abbreviateNumber(marketSize)} ${name}`}
                          </SubText>
                        </TextItem>

                        <TextItem align="end" direction="column">
                          <PrimaryText color="clrTextPrimary" size="small">
                            {`$${abbreviateNumber(Number(totalBorrowedUsd).toFixed(2))}`}
                          </PrimaryText>
                          <SubText
                            margin={{ top: 'xxsmall' }}
                            size="xsmall"
                            color={'clrTextSecondary'}
                          >{`${abbreviateNumber(totalBorrowed)} ${name}`}</SubText>
                        </TextItem>
                      </>
                    )}

                    <TextItem justify="end">
                      <PrimaryText color="clrSupplyText" size="small">
                        {depositAPY}%
                      </PrimaryText>
                    </TextItem>
                    <TextItem justify="end">
                      <PrimaryText color="clrBorrowText" size="small">
                        {borrowApy}%
                      </PrimaryText>
                    </TextItem>

                    <TextItem justify="end">
                      {/* <InfoTooltip content={tooltip}> */}
                      <SecondaryBtn
                        isConnected={() => {
                          !isAccountConnected && connectAccount()

                          if (chainType === Chain.ethereum || ['UMEE', 'DAI'].includes(name)) {
                            !account && connect()
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation()

                          if (chainType === Chain.ethereum) {
                            setModalInfo(name, address, 'bridge', logo)
                          } else if (['UMEE', 'DAI'].includes(name)) {
                            setModalInfo(name, ethAddress[name], 'bridge', logo)
                          } else {
                            setModalInfo(name, address, 'ibc', logo)
                          }
                        }}
                        round="large"
                        pad={{ vertical: 'small', horizontal: 'small' }}
                        text="Transfer"
                        textSize="xsmall"
                        disabled={chainType === Chain.ethereum && !['ATOM'].includes(name)}
                      />
                      {/* </InfoTooltip> */}
                    </TextItem>
                  </DataListRow>
                )
              }
            },
          ) : (
            <LoaderWrapper>
              <Loading />
            </LoaderWrapper>
          )}
      </DataList>
    </>
  )
}

export default MarketsDataList

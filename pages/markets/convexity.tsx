import React, { useEffect, useState } from 'react'
import { MarketsDataList } from 'components'
import { IDataListColumn } from 'components/DataList/DataList'
import PageLoading from 'components/common/Loading/PageLoading'
import { useStore } from 'api/cosmosStores'
import { useConvexityData } from 'api/convexity'
import { observer } from 'mobx-react-lite'
import MarketsOverview from 'components/Markets/MarketsOverview'
import { Box } from 'grommet'
import { IMarketsData } from 'components/Markets/MarketsDataList'
import { bigNumberToString } from 'lib/number-utils'

interface ConvexityProps {
  marketColumns: IDataListColumn[]
  marketMobileColumns: IDataListColumn[]
  size: string
  chain: string
}

const Convexity: React.FC<ConvexityProps> = ({ marketColumns, marketMobileColumns, size, chain }) => {
  const { RegisteredTokens, getConvexityData, MarketsSummary } = useConvexityData()
  const { accountStore, chainStore } = useStore()
  const account = accountStore.getAccount(chainStore.current.chainId)
  const [marketsData, setMarketsData] = useState<IMarketsData[]>()

  // useEffect(() => {
  //   getConvexityData();
  // }, []);

  useEffect(() => {
    if (RegisteredTokens.length > 0) {
      setMarketsData(
        RegisteredTokens.map((token) => {
          const marketsData: IMarketsData = {
            name: token.name,
            address: token.address,
            marketSize: bigNumberToString(token.marketSize, token.decimals),
            marketSizeUsd: token.marketSizeUsd,
            totalBorrowed: token.totalBorrowed,
            totalBorrowedUsd: token.totalBorrowedUsd,
            depositAPY: token.depositAPY,
            variableBorrowAPR: token.variableBorrowAPR,
            ltv: token.ltv,
            chain: token.chainName,
            logo: token.logo
          }

          return marketsData
        }),
      )
    }
  }, [RegisteredTokens, account])

  return (
    <>
      <MarketsOverview overviews={MarketsSummary} />
      <Box margin={{ top: 'large' }}>
        <MarketsDataList
          chainType={chain}
          columns={size === 'small' || size === 'medium' ? marketMobileColumns : marketColumns}
          data={marketsData}
        />
      </Box>
    </>
  )
}

export default observer(Convexity)

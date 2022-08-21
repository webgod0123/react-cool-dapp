import React, { useCallback, useContext, useEffect, useState } from 'react'
import { IDataListColumn } from 'components/DataList/DataList'
import Layout from 'pages/Layout'
import { ResponsiveContext, Text } from 'grommet'
import Convexity from './convexity'
import Reflection from './reflection'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { useStore } from 'api/cosmosStores'
import { useWeb3 } from 'api/web3'
import { useData } from 'api/data'
import { useBridgeHistory } from 'api/data/transactions'
import { EmbedChainInfos } from '../../config'
import { useUmeeTokenAddress } from 'api/web3/chains'
import { IReserveConfigurationData } from 'lib/types'
import TransferHistoryList from 'components/Markets/TransferHistoryList'
import { WalletStatus } from '@keplr-wallet/stores'
import TagManager from 'react-gtm-module'
import { observer } from 'mobx-react-lite'

const tagManagerArgs = {
  dataLayer: {
    userId: '0x000000000000000000',
    userProject: 'umeev1',
    page: 'markets',
  },
  dataLayerName: 'MarketLayer',
}

export const BridgeTransferEventContext = React.createContext(() => {})

const transferPageSize = 10

const TotalSuppliedTooltip = () => (
  <>
    <Text size="small" color={'clrTextPrimary'} weight="bold">
      Total Supplied
    </Text>
    <Text size="13px" margin={{ top: 'small' }} color="clrTooltipText">
      Total value of assets supplied for lending.
    </Text>
  </>
)

const TotalBorrowedTooltip = () => (
  <>
    <Text size="small" color={'clrTextPrimary'} weight="bold">
      Total Borrowed
    </Text>
    <Text size="13px" margin={{ top: 'small' }} color="clrTooltipText">
      Total value of assets borrowed.
    </Text>
  </>
)

const SupplyAPRTooltip = () => (
  <>
    <Text size="small" color={'clrTextPrimary'} weight="bold">
      Supply APR
    </Text>
    <Text size="13px" margin={{ top: 'small' }} color="clrTooltipText">
      Interest rate on supplied assets received by suppliers.
    </Text>
  </>
)

const BorrowAPRTooltip = () => (
  <>
    <Text size="small" color={'clrTextPrimary'} weight="bold">
      Borrow APR
    </Text>
    <Text size="13px" margin={{ top: 'small' }} color="clrTooltipText">
      Interest rate paid on liabilities by borrowers.
    </Text>
  </>
)

function Markets() {
  const { chainMode } = useChain()
  const size = useContext(ResponsiveContext)
  const { chainStore, accountStore } = useStore()
  const { account: etherAddr, chainId } = useWeb3()
  const { ReserveConfigurationData } = useData()
  const umeeTokenAddr = useUmeeTokenAddress(chainId)
  const umeeCurrency = { address: umeeTokenAddr, decimals: 6, symbol: 'UMEE' } as unknown as IReserveConfigurationData
  const [transferPage, setTransferPage] = useState<number>(1)
  TagManager.dataLayer(tagManagerArgs)

  // const cosmosChainInfo = chainStore.getChain(EmbedChainInfos[1].chainId)
  // const osmoChainInfo = chainStore.getChain(EmbedChainInfos[2].chainId)
  // const junoChainInfo = chainStore.getChain(EmbedChainInfos[3].chainId)

  // const umeeAccount = accountStore.getAccount(chainStore.current.chainId)
  // const cosmosAccount = accountStore.getAccount(cosmosChainInfo.chainId)
  // const junoAccount = accountStore.getAccount(junoChainInfo.chainId)
  // const osmoAccount = accountStore.getAccount(osmoChainInfo.chainId)

  // useEffect(() => {
  //   if (umeeAccount.walletStatus === WalletStatus.Loaded) {
  //     if (cosmosAccount.walletStatus === WalletStatus.NotInit) {
  //       cosmosAccount.init()
  //     }

  //     if (junoAccount.walletStatus === WalletStatus.NotInit) {
  //       junoAccount.init()
  //     }

  //     if (osmoAccount.walletStatus === WalletStatus.NotInit) {
  //       osmoAccount.init()
  //     }
  //   }
  // }, [cosmosAccount, junoAccount, osmoAccount, umeeAccount, umeeAccount.walletStatus])

  // const { transferHistory, refetch } = useBridgeHistory(
  //   [
  //     etherAddr?.toLowerCase() ?? '',
  //     umeeAccount.bech32Address,
  //     cosmosAccount.bech32Address,
  //     junoAccount.bech32Address,
  //     osmoAccount.bech32Address,
  //   ],
  //   [chainStore.current.currencies, cosmosChainInfo.currencies, junoChainInfo.currencies, osmoChainInfo.currencies],
  //   ReserveConfigurationData.concat(umeeCurrency),
  //   chainMode === Chain.cosmos,
  //   chainId === 1
  // )

  // const handleBridgeTransfer = useCallback(() => {
  //   refetch()
  //   setTransferPage(1)
  // }, [refetch])

  const marketColumns: IDataListColumn[] = [
    { title: 'Market', size: 'small' },
    {
      title: 'Total Supplied',
      size: 'flex',
      tooltip: <TotalSuppliedTooltip />,
      jusitfy: 'end',
    },
    {
      title: 'Total Borrowed',
      size: 'flex',
      tooltip: <TotalBorrowedTooltip />,
      jusitfy: 'end',
    },
    {
      title: `Supply ${chainMode === Chain.cosmos ? 'APR' : 'APY'}`,
      size: 'flex',
      tooltip: <SupplyAPRTooltip />,
      jusitfy: 'end',
    },
    {
      title: `Borrow ${chainMode === Chain.cosmos ? 'APR' : 'APY'}`,
      size: 'flex',
      tooltip: <BorrowAPRTooltip />,
      jusitfy: 'end',
    },
    { title: '', size: 'flex' },
  ]

  const marketMobileColumns: IDataListColumn[] = [
    { title: 'Market', size: 'small' },
    {
      title: `Supply ${chainMode === Chain.cosmos ? 'APR' : 'APY'}`,
      size: 'flex',
      tooltip: <SupplyAPRTooltip />,
      jusitfy: 'end',
    },
    {
      title: `Borrow ${chainMode === Chain.cosmos ? 'APR' : 'APY'}`,
      size: 'flex',
      tooltip: <BorrowAPRTooltip />,
      jusitfy: 'end',
    },
    { title: '', size: 'flex' },
  ]

  const historyColumns: IDataListColumn[] = [
    { title: 'TRANSACTION', size: 'flex' },
    { title: 'TYPE', size: 'flex' },
    { title: 'AMOUNT', size: 'flex' },
    { title: 'CURRENT STATUS', size: 'flex' },
    { title: '', size: 'flex' },
  ]

  const historyMobileColumns: IDataListColumn[] = [
    { title: 'TRANSACTION', size: 'flex' },
    { title: 'AMOUNT', size: 'xsmall' },
    { title: 'CURRENT STATUS', size: 'flex' },
  ]

  return (
    <Layout title="Markets" subtitle="Markets available for cross-chain leverage">
      {/* <BridgeTransferEventContext.Provider value={handleBridgeTransfer}> */}
      {size === 'small' && (
        <Text
          alignSelf="center"
          margin={{ bottom: 'medium' }}
          className="font-moret"
          color={'clrTextPrimary'}
          size="medium1"
        >
          Markets
        </Text>
      )}
      {chainMode === Chain.cosmos ? (
        <Convexity
          size={size}
          chain={chainMode}
          marketColumns={marketColumns}
          marketMobileColumns={marketMobileColumns}
        />
      ) : (
        <Reflection
          size={size}
          chain={chainMode}
          marketColumns={marketColumns}
          marketMobileColumns={marketMobileColumns}
        />
      )}

      {/* {transferHistory.length > 0 && (
          <TransferHistoryList
            columns={size === 'medium' || size === 'small' ? historyMobileColumns : historyColumns}
            data={transferHistory.slice((transferPage - 1) * transferPageSize, transferPage * transferPageSize)}
            totalPages={Math.ceil(transferHistory.length / transferPageSize)}
            onPageChange={setTransferPage}
            page={transferPage}
          />
        )} */}
      {/* </BridgeTransferEventContext.Provider> */}
    </Layout>
  )
}

export default observer(Markets)

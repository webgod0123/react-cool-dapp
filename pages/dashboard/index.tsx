import React, { useContext } from 'react'
import { IDataListColumn } from 'components/DataList/DataList'
import Layout from 'pages/Layout'
import { Chain, useChain } from 'lib/hooks/chain/context'
import Reflection from './reflection'
import Convexity from './convexity'
import { ResponsiveContext, Text } from 'grommet'

const Dashboard = () => {
  const { chainMode } = useChain()
  const size = useContext(ResponsiveContext)

  const depositsColumns: IDataListColumn[] = [
    { title: 'Market', size: 'flex' },
    { title: 'Supplied', size: 'flex', jusitfy: 'end' },
    { title: `${chainMode === Chain.cosmos ? 'APR' : 'APY'}`, size: 'xsmall', jusitfy: 'end' },
    { title: '', size: 'flex' },
  ]

  const availableMarketsColumns: IDataListColumn[] = [
    { title: 'Market', size: 'flex' },
    {
      title: 'Available',
      size: 'flex',
      tooltip: 'Assets available for you to supply and borrow based on your balances',
      jusitfy: 'end',
    },
    { title: `${chainMode === Chain.cosmos ? 'APR' : 'APY'}`, size: 'xsmall', jusitfy: 'end' },
    { title: '', size: 'flex' },
  ]

  const borrowsColumns: IDataListColumn[] = [
    { title: 'Market', size: 'flex' },
    { title: 'Borrowed', size: 'flex', jusitfy: 'end' },
    { title: `${chainMode === Chain.cosmos ? 'APR' : 'APY'}`, size: 'xsmall', jusitfy: 'end' },
    { title: '', size: 'flex' },
  ]

  return (
    <Layout title="Dashboard" subtitle="Your portfolio of Umee assets">
      {size === 'small' && (
        <Text
          alignSelf="center"
          margin={{ bottom: 'medium' }}
          className="font-moret"
          color={'clrTextPrimary'}
          size="medium1"
        >
          Dashboard
        </Text>
      )}
      {chainMode == Chain.ethereum ? (
        <Reflection
          availableMarketsColumns={availableMarketsColumns}
          depositsColumns={depositsColumns}
          borrowsColumns={borrowsColumns}
        />
      ) : (
        <Convexity
          availableMarketsColumns={availableMarketsColumns}
          depositsColumns={depositsColumns}
          borrowsColumns={borrowsColumns}
        />
      )}
    </Layout>
  )
}

export default Dashboard

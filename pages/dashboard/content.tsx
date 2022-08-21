import React, { useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, ResponsiveContext } from 'grommet'
import { ETxnType, IUserTxnBorrow, IUserTxnDeposit } from 'lib/types'
import { IDataListColumn } from 'components/DataList/DataList'
import DashboardOverview from 'components/Dashboard/DashboardOverview'
import NoWalletConnectedBox from 'components/NoWalletConnectedBox'
import DepositModalDesktop from 'components/Deposits/DepositDesktop'
import BottomMenus from 'components/common/BottomMenu/BottomMenus'
import TransactionModal from 'components/TransactionsMobile/Transactions'
import BorrowModalDesktop from 'components/Borrows/BorrowDesktop'
import DepositsDataList from 'components/Deposits/DataList/DepositsDataList'
import BorrowsDataList from 'components/Borrows/DataList/BorrowsDataList'
import AvailableDepositsDataList, {
  IAvailableDepositsData,
} from 'components/Deposits/DataList/AvailableDepositsDataList'
import AvailableBorrowsDataList, { IAvailableBorrowsData } from 'components/Borrows/DataList/AvailableBorrowsDataList'

interface Props {
  logedIn: boolean
  accountData: boolean
  myDepositsTotal: number
  myBorrowsTotal: number
  totalCollateral: string
  borrowLimit: number
  averageAPY: number
  borrowLimitUsed: number
  depositData: IUserTxnDeposit[]
  availableDepositsData: IAvailableDepositsData[]
  borrowData: IUserTxnBorrow[]
  availableBorrowsData: IAvailableBorrowsData[]
  depositsColumns: IDataListColumn[]
  borrowsColumns: IDataListColumn[]
  availableMarketsColumns: IDataListColumn[]
}

export type stateType = {
  tokenAddress: string
  symbol: string
  txnType: ETxnType
  logo: string
}

const DashBoardContent = ({
  logedIn,
  accountData,
  myDepositsTotal,
  myBorrowsTotal,
  totalCollateral,
  borrowLimit,
  averageAPY,
  borrowLimitUsed,
  depositData,
  availableDepositsData,
  borrowData,
  availableBorrowsData,
  depositsColumns,
  borrowsColumns,
  availableMarketsColumns,
}: Props) => {
  const { state } = useLocation<stateType>()
  const [modalShow, setModalShow] = useState<ETxnType | undefined>(state ? state.txnType : undefined)
  const [tokenAddress, setTokenAddress] = useState<string>(state ? state.tokenAddress : '')
  const [clickedTxnType, setClickedTxnType] = useState<ETxnType>()
  const [symbol, setSymbol] = useState<string>(state ? state.symbol : '')
  const [logo, setLogo] = useState<string>(state ? state.logo : '')
  const size = useContext(ResponsiveContext)

  const closeModal = () => {
    setTokenAddress('')
    setModalShow(undefined)
    setSymbol('')
  }

  const openModal = (symbol: string, modalShow: ETxnType, address: string, logo?: string) => {
    setTokenAddress(address)
    setModalShow(modalShow)
    setSymbol(symbol)
    setLogo(logo || '')
  }

  return (
    <>
      {!logedIn ? (
        <NoWalletConnectedBox />
      ) : (
        <>
          <DashboardOverview
            myDepositsTotal={myDepositsTotal}
            myBorrowsTotal={myBorrowsTotal}
            totalCollateral={totalCollateral}
            borrowLimit={borrowLimit}
            averageAPY={averageAPY}
            borrowLimitUsed={borrowLimitUsed}
          />
          <Box margin={{ top: 'large' }}>
            <Box
              width="auto"
              direction={size === 'large' || size === 'medium' || size === 'small' ? 'column' : 'row'}
              gap={size === 'medium' || size === 'small' ? 'xlarge' : 'medium'}
            >
              <Box
                direction="column"
                width={size === 'medium' || size === 'small' || size === 'large' ? '100%' : '50%'}
              >
                <DepositsDataList onSelect={openModal} columns={depositsColumns} data={depositData} />
                <AvailableDepositsDataList
                  onSelect={openModal}
                  columns={availableMarketsColumns}
                  data={availableDepositsData}
                />
              </Box>
              <Box
                direction="column"
                width={size === 'medium' || size === 'small' || size === 'large' ? '100%' : '50%'}
              >
                <BorrowsDataList onSelect={openModal} columns={borrowsColumns} data={borrowData} />
                <AvailableBorrowsDataList
                  onSelect={openModal}
                  columns={availableMarketsColumns}
                  data={availableBorrowsData}
                />
              </Box>
            </Box>
          </Box>

          {size !== 'small' &&
            tokenAddress &&
            (modalShow === ETxnType.deposit ? (
              <DepositModalDesktop logo={logo} address={tokenAddress} symbol={symbol} onClose={closeModal} />
            ) : (
              <BorrowModalDesktop logo={logo} address={tokenAddress} symbol={symbol} onClose={closeModal} />
            ))}

          {size === 'small' && (
            <>
              <BottomMenus
                open={!!tokenAddress}
                symbol={symbol}
                items={
                  modalShow === ETxnType.deposit
                    ? [ETxnType.deposit, ETxnType.withdraw, ETxnType.transfer]
                    : [ETxnType.borrow, ETxnType.repay, ETxnType.transfer]
                }
                setOpenSheet={() => setTokenAddress('')}
                setSelectedMenu={setClickedTxnType}
              />
              <TransactionModal
                txnType={clickedTxnType}
                onClose={() => setClickedTxnType(undefined)}
                tokenAddress={tokenAddress}
                symbol={symbol}
                logo={logo}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

export default DashBoardContent

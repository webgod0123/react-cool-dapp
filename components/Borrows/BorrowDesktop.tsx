import React from 'react'
import { BaseModal } from 'components/common/Modals/BaseModal'
import BorrowModal from '.'

const BorrowModalDesktop = ({
  address: tokenAddress,
  symbol,
  onClose,
  logo
}: {
  address: string
  symbol: string
  onClose: () => void
  logo: string
}) => {
  return (
    <BaseModal logo={logo} symbol={symbol} onClose={onClose}>
      <BorrowModal address={tokenAddress} onClose={onClose} />
    </BaseModal>
  )
}

export default BorrowModalDesktop

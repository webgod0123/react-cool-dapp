import React from 'react'
import { BaseModal } from 'components/common/Modals/BaseModal'
import DepositModal from '.'

const DepositModalDesktop = ({
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
      <DepositModal address={tokenAddress} onClose={onClose} />
    </BaseModal>
  )
}

export default DepositModalDesktop

import { useStake } from 'api/stake'
import React, { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { bigNumberToNumber, fixedLocaleString } from 'lib/number-utils'
import { Text } from 'grommet'
import Spinner from './common/Loading/Spinner'

const TotalStaked = ({ color, size }: { color?: string; size?: string }) => {
  const { Delegations } = useStake()

  let totalStaked = useMemo(() => {
    let result = 0
    if (Delegations) {
      let total = 0

      if (Delegations.length > 0) {
        Delegations.map((delegation) => {
          total += Number(delegation.balance.amount)
        })
        result = bigNumberToNumber(BigNumber.from(total.toString()), 6)
      }
    }
    return result
  }, [Delegations])

  return totalStaked !== undefined ? (
    <Text size={size || 'small'} color={color || 'clrTextPrimary'}>
      {fixedLocaleString(totalStaked, 2)} UMEE
    </Text>
  ) : (
    <Spinner margin={{ left: 'xsmall' }} />
  )
}

export default TotalStaked

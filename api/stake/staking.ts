import { useCallback, useState } from 'react'
import { Operator, Validator } from './data'
import { CosmosQueries } from '@keplr-wallet/stores'
import parse from 'parse-duration'

export const useAPR = () => {
  const [apr, setAPR] = useState<number>(0)

  const fetchAPR = useCallback(() => {
    fetch('https://chains.cosmos.directory/umee')
      .then((res) => res.json())
      .then((res) => {
        setAPR(res.chain.params.calculated_apr)
      })
  }, [])

  const runsPerDay = (max: number | undefined, runTime: any) => {
    let runs = 0
    if (Array.isArray(runTime)) {
      runs = runTime.length
    } else {
      if (runTime.startsWith('every')) {
        const interval = parse(runTime.replace('every ', ''))
        runs = (1000 * 60 * 60 * 24) / interval
      } else {
        runs = 1
      }
    }
    return max && runs > max ? max : runs
  }

  const validatorAPR = (operators: Operator[] | undefined, validator: Validator) => {
    const operator = operators?.find((operator) => operator.address === validator.operator_address)
    const periodPerYear = operator && validator.restake ? runsPerDay(undefined, validator.restake.run_time) * 365 : 1
    const realApr = apr * (1 - parseFloat(validator.commission_rates.rate))
    const apy = (1 + realApr / periodPerYear) ** periodPerYear - 1

    return (apy * 100).toFixed(2)
  }

  return { apr, fetchAPR, validatorAPR }
}

export const useDelegations = (address: string, queries: CosmosQueries) => {
  const data = queries.queryDelegations.getQueryBech32Address(address).delegations

  const delegations = data.filter((item) => {
    const balance = typeof item.balance === 'string' ? item.balance : item.balance.amount
    return Number(balance) > 0
  })

  return {
    delegations,
    fetchDelegations: useCallback(() => {
      if (address) queries.queryDelegations.getQueryBech32Address(address).fetch()
    }, [address, queries.queryDelegations]),
  }
}

export const useRewards = (address: string, queries: CosmosQueries) => {
  const res = queries.queryRewards.getQueryBech32Address(address).response

  return {
    rewards: res?.data.result,
    fetchRewards: useCallback(() => {
      if (address) queries.queryRewards.getQueryBech32Address(address).fetch()
    }, [address, queries.queryRewards]),
  }
}

export const useValidators = () => {
  const [validators, setValidators] = useState<Validator[]>()

  const fetchValidators = useCallback(async () => {
    const validatorsRes = await fetch('https://validators.cosmos.directory/chains/umee')
    const validatorsArr = await validatorsRes.json()
    let validators = []
    if (validatorsArr) validators = validatorsArr.validators

    const validatorArr = []

    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i]

      const validatorData: Validator = {
        operator_address: validator.address,
        tokens: Number(validator.tokens),
        moniker: validator.description.moniker,
        commission_rates: validator.commission.commission_rates,
        last_commission_update: validator.commission.update_time,
        description: validator.description,
        status: validator.status,
        rank: validator.rank,
        img_url: validator.mintscan_image || validator.keybase_image || '',
        apr: 0,
      }

      if (validator.restake) validatorData.restake = validator.restake

      if (validator.status === 'BOND_STATUS_BONDED') validatorArr.push(validatorData)
    }

    setValidators(
      validatorArr.sort((a, b) => {
        return a.rank - b.rank
      }),
    )
  }, [])

  // useEffect(() => {
  //   fetchValidators();
  // }, []);

  return {
    validators,
    fetchValidators,
  }
}

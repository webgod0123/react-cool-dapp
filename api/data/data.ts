import { BigNumber } from 'ethers'
import { useWeb3 } from '../web3'
import { UmeeProtocolDataProvider, LendingPool, Gravity } from '../types'
import { useUmeeProtocolDataProviderContract, useLendingPoolContract, useGravityContract } from './contracts'
import useReserveData from './assetdata'
import { IReserveConfigurationData, IAssetPrices, IReserveData, IUserReserveData } from 'lib/types'

export interface Data {
  Contracts: {
    dataProvider?: UmeeProtocolDataProvider;
    lendingPool?: LendingPool;
    gravity?: Gravity;
  };
  Addresses: {
    addressProvider?: string;
    reserve?: { symbol: string; tokenAddress: string }[];
  };
  ReserveConfigurationData: IReserveConfigurationData[];
  ReserveData: IReserveData[];
  UserAccountData?: {
    totalCollateralETH: BigNumber;
    totalDebtETH: BigNumber;
    availableBorrowsETH: BigNumber;
    currentLiquidationThreshold: BigNumber;
    ltv: BigNumber;
    healthFactor: BigNumber;
  };
  UserReserveData: IUserReserveData[];
  priceData: IAssetPrices | undefined;
}

function useSystemData() {
  const { account } = useWeb3()

  const UmeeProtocolDataProviderContract = useUmeeProtocolDataProviderContract()
  const LendingPoolContract = useLendingPoolContract()
  const GravityContract = useGravityContract()

  const {
    allReserveTokens: returnAssetData,
    reserveConfigurationData: returnReserveConfigurationData,
    reserveData: returnReserveData,
    userReserveData: returnUserReserveData,
    userAccountData: returnUserAccountData,
    priceData
  } = useReserveData(UmeeProtocolDataProviderContract, LendingPoolContract, account)

  const data: Data = {
    Contracts: {
      dataProvider: UmeeProtocolDataProviderContract,
      lendingPool: LendingPoolContract,
      gravity: GravityContract,
    },
    Addresses: {
      reserve: returnAssetData,
    },
    ReserveConfigurationData: returnReserveConfigurationData,
    ReserveData: returnReserveData,
    UserAccountData: returnUserAccountData,
    UserReserveData: returnUserReserveData,
    priceData,
  }

  return data
}

export { useSystemData }

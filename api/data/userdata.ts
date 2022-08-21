import { useState, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { IUserReserveData } from 'lib/types'
import { MeterProps } from 'grommet'
import { bigNumberToNumber } from 'lib/number-utils'
import { IAssetPrices } from 'lib/types'

export interface IUserCollateralTotals {
  ETH: string;
  USD: string;
}

export const useUserCollateralTotals = (
  priceData: IAssetPrices | undefined,
  userReserves: IUserReserveData[],
  toFixedETH = 5,
  toFixedUSD = 2
) => {
  const [collateralTotals, setCollateralTotals] = useState<IUserCollateralTotals>();

  useEffect(() => {
    if (!priceData || !userReserves.length) return;

    let totalETH = 0;
    let totalUSD = 0;

    for (let r = 0, rl = userReserves.length; r < rl; r += 1) {
      const reserveToken = userReserves[r];
      const tokenDecimals = reserveToken.decimals;
      const tokenCount = bigNumberToNumber(reserveToken.currentUTokenBalance, tokenDecimals || BigNumber.from(18));
      if (reserveToken.usageAsCollateralEnabled) {
        const usdPrice = tokenCount * priceData[reserveToken.symbol].usd;
        totalUSD += usdPrice;
        const ethPrice = tokenCount * priceData[reserveToken.symbol].eth;
        totalETH += ethPrice;
      }
    }

    setCollateralTotals({
      ETH: totalETH.toFixed(toFixedETH),
      USD: totalUSD.toFixed(toFixedUSD),
    });
  }, [priceData, userReserves, toFixedETH, toFixedUSD]);

  return collateralTotals;
};

export interface ITokenCollateralData {
  symbol: string;
  count: BigNumber;
  ethPrice: string;
  usdPrice: string;
}

export interface IUserCollateralData {
  [symbol: string]: ITokenCollateralData;
}

export const useUserCollateralData = (
  priceData: IAssetPrices | undefined,
  userReserves: IUserReserveData[],
  toFixedETH = 5,
  toFixedUSD = 2
) => {
  const [collateralData, setCollateralData] = useState<IUserCollateralData>();

  useEffect(() => {
    if (!priceData || !userReserves.length) return;

    const collateral: IUserCollateralData = {};

    for (let r = 0, rl = userReserves.length; r < rl; r += 1) {
      const reserveToken = userReserves[r];
      const tokenDecimals = reserveToken.decimals;
      const tokenCount = bigNumberToNumber(reserveToken.currentUTokenBalance, tokenDecimals || BigNumber.from(18));
      if (reserveToken.usageAsCollateralEnabled) {
        const usdPrice = tokenCount * priceData[reserveToken.symbol].usd;
        const ethPrice = tokenCount * priceData[reserveToken.symbol].eth;
        collateral[reserveToken.symbol] = {
          symbol: reserveToken.symbol,
          count: reserveToken.currentUTokenBalance,
          ethPrice: ethPrice.toFixed(toFixedETH),
          usdPrice: usdPrice.toFixed(toFixedUSD),
        };
      }
    }

    setCollateralData(collateral);
  }, [priceData, userReserves, toFixedETH, toFixedUSD]);

  return collateralData;
};

export const useUserCollateralChartData = (
  priceData: IAssetPrices | undefined,
  userReserves: IUserReserveData[],
) => {
  const [chartData, setChartData] = useState<MeterProps['values']>();
  const userCollateralTotals = useUserCollateralTotals(priceData, userReserves);

  useEffect(() => {
    const chartValues = [];
    if (!userCollateralTotals?.USD || !priceData || !userReserves.length) return;

    for (let r = 0, rl = userReserves.length; r < rl; r += 1) {
      const reserveToken = userReserves[r];
      if (reserveToken.usageAsCollateralEnabled) {
        const usdPrice = priceData[reserveToken.symbol].usd;
        const tokenDecimals = reserveToken.decimals;
        const tokenCount = bigNumberToNumber(reserveToken.currentUTokenBalance, tokenDecimals || BigNumber.from(18));
        chartValues.push({
          value: (tokenCount * usdPrice) / Number(userCollateralTotals.USD),
          label: reserveToken.symbol,
          highlight: true,
        });
      }
      else{
        chartValues.push({
          value: 0,
          label: '',
        });
      }
    }
    setChartData(chartValues);
  }, [userReserves, priceData, userCollateralTotals]);

  return chartData;
};

export const useUserDepositChartData = (
  priceData: IAssetPrices | undefined,
  userReserves: IUserReserveData[],
) => {
  const [chartData, setChartData] = useState<MeterProps['values']>();

  useEffect(() => {
    if (!priceData || !userReserves.length) return;
    const chartValues = [];
    const totalUsdValue = userReserves.reduce((acc, r) => {
      const usdPrice = priceData[r.symbol].usd;
      const tokenCount = bigNumberToNumber(r.currentUTokenBalance, r.decimals || BigNumber.from(18));
      return acc + tokenCount * usdPrice;
    }, 0);

    for (let r = 0, rl = userReserves.length; r < rl; r += 1) {
      const reserveToken = userReserves[r];
      const usdPrice = priceData[reserveToken.symbol].usd;
      const tokenDecimals = reserveToken.decimals;
      const tokenCount = bigNumberToNumber(reserveToken.currentUTokenBalance, tokenDecimals || BigNumber.from(18));
      chartValues.push({
        value: (tokenCount * usdPrice) / totalUsdValue,
        label: reserveToken.symbol,
      });
    }
    setChartData(chartValues);
  }, [userReserves, priceData]);

  return chartData;
};

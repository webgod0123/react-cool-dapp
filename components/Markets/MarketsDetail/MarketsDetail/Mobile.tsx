import React, { useMemo, useState } from 'react'
import { useWeb3 } from 'api/web3'
import { InfoPanelItem } from 'components/InfoBar'
import InfoCustomMeter from 'components/InfoBar/InfoCustomMeter'
import { InfoPanelItemStyles } from 'components/InfoBar/InfoPanelItem'
import { BigNumber } from 'ethers'
import { Box, Image, Text } from 'grommet'
import { bigNumberToString, bigNumberToUSDString } from 'lib/number-utils'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { useStore } from 'api/cosmosStores'
import Logo from '../../../../public/images/Logo.svg'
import { useConvexityData } from 'api/convexity'
import { observer } from 'mobx-react-lite'
import { MarketsDetailPanelProps } from '.'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import VectorWhite from '../../../../public/images/vector-white.svg'
import VectorDark from '../../../../public/images/vector-dark.svg'
import { ButtonItem } from 'components/DataList'
import { ETxnType } from 'lib/types'
import TransactionModal from 'components/TransactionsMobile/Transactions'

const MarketsDetailMobile = ({ marketsDetail }: { marketsDetail: MarketsDetailPanelProps }) => {
  const web3 = useWeb3()
  const { chainMode } = useChain()
  const { accountStore, chainStore } = useStore()
  const umeeAddress = accountStore.getAccount(chainStore.current.chainId).bech32Address
  const { ConvexityPriceData } = useConvexityData()
  const [txnType, setTxnType] = useState<ETxnType>()

  const {
    borrowedPortion,
    totalBorrowedUsd,
    availableLiquidityUsd,
    liquidationThreshold,
    ltv,
    liquidationBonus,
    symbol,
    canUseAsCollateral,
    balance,
    decimals,
    liquidityRate,
    variableBorrowRate,
    currentVariableDebt,
    currentStableDebt,
    currentUTokenBalance,
    availableBorrowAmount,
    tokenAddress,
    title,
    description,
    logo,
    usdPrice
  } = marketsDetail

  const { themeMode } = useTheme()

  const marketSize = useMemo(() => {
    return Number(totalBorrowedUsd) + Number(availableLiquidityUsd)
  }, [availableLiquidityUsd, totalBorrowedUsd])

  const loggedIn = useMemo(() => {
    let loggedIn = true
    if (chainMode === Chain.cosmos) {
      if (!umeeAddress) loggedIn = false
    } else {
      if (!web3.account) loggedIn = false
    }

    return loggedIn
  }, [chainMode, umeeAddress, web3.account])

  return (
    <>
      {marketsDetail && (
        <>
          <Box>
            <Box pad={{ horizontal: 'large', bottom: 'xlarge' }}>
              <Box style={{ position: 'relative' }} pad={{ vertical: 'medium', horizontal: 'medium' }}>
                <Box direction="row" justify="center" pad={{ vertical: 'xlarge' }}>
                  <InfoCustomMeter value={borrowedPortion} />
                </Box>
                <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Box direction="row" justify="center">
                    <Text size="small" color={'clrTextPrimary'}>
                      $
                    </Text>
                    <Text margin={{ horizontal: 'xsmall', top: '-4px' }} size="medium1" color={'clrTextPrimary'}>
                      {Math.floor(marketSize).toLocaleString()}
                    </Text>
                    <Text size="small" color={'clrTextPrimary'}>
                      {(marketSize - Math.floor(marketSize)).toFixed(2).substring(1)}
                    </Text>
                  </Box>
                  <Text size="small" textAlign="center" margin={{ top: 'xsmall' }} color="clrTextSecondary">
                    Market Size
                  </Text>
                </Box>
              </Box>
              <Box>
                <InfoPanelItem
                  title="Available Liquidity"
                  titleBg="clrSupply"
                  titleDirection="row"
                  textSize="small"
                  data={[
                    { value: '$', textSize: 'small' },
                    {
                      value: Number(availableLiquidityUsd).toLocaleString(),
                      textSize: 'small',
                    },
                  ]}
                  align={'center'}
                  justify="between"
                  style={InfoPanelItemStyles.Horizontal}
                />
              </Box>
              <Box margin={{ top: 'large' }}>
                <InfoPanelItem
                  title="Total Borrowed"
                  titleBg="clrBorrow"
                  titleDirection="row"
                  textSize="small"
                  data={[
                    { value: '$', textSize: 'small' },
                    {
                      value: Number(totalBorrowedUsd).toLocaleString(),
                      textSize: 'small',
                    },
                  ]}
                  align={'center'}
                  justify="between"
                  style={InfoPanelItemStyles.Horizontal}
                />
              </Box>
            </Box>
            <Box pad={{ vertical: 'xlarge', horizontal: 'large' }} border={{ side: 'top', color: 'clrBorderGrey' }}>
              <Text size="medium1" alignSelf="center" color="clrTextPrimary" className="font-moret">
                Positions
              </Text>
              <Box margin={{ top: 'xlarge' }}>
                <Box direction="row" justify="between" pad={{ bottom: 'large' }}>
                  <Box>
                    <Text color={'clrSupplyText'} size="medium1">
                      ${Number(bigNumberToUSDString(currentUTokenBalance, decimals, usdPrice, 2)).toLocaleString()}
                    </Text>
                    <Text color={'clrTextSecondary'} size="small">
                      {loggedIn
                        ? `${Number(bigNumberToString(currentUTokenBalance, decimals)).toLocaleString()} ${symbol}`
                        : '—'}
                    </Text>
                  </Box>
                  <Box>
                    <Box direction="row" align="start">
                      <Text alignSelf="end" size="medium1" color={'clrSupplyText'}>
                        {chainMode == Chain.cosmos
                          ? liquidityRate.toString()
                          : bigNumberToString(liquidityRate, BigNumber.from(25))}
                      </Text>
                      <Text margin={{ top: 'xsmall' }} size="small" color={'clrSupplyText'}>
                        %
                      </Text>
                    </Box>
                    <Text alignSelf="end" color={'clrTextSecondary'} size="small">
                      Supply {chainMode === Chain.cosmos ? 'APR' : 'APY'}
                    </Text>
                  </Box>
                </Box>
                <Box
                  border={{ side: 'top', color: 'clrBorderGrey' }}
                  direction="row"
                  justify="between"
                  pad={{ top: 'large' }}
                >
                  <Box>
                    <Text color={'clrBorrowText'} size="medium1">
                      ${Number(bigNumberToUSDString(currentVariableDebt, decimals, usdPrice, 2)).toLocaleString()}
                    </Text>
                    <Text color={'clrTextSecondary'} size="small">
                      {loggedIn
                        ? `${Number(bigNumberToString(currentVariableDebt, decimals)).toLocaleString()} ${symbol}`
                        : '—'}
                    </Text>
                  </Box>
                  <Box>
                    <Box direction="row" align="start">
                      <Text alignSelf="end" size="medium1" color={'clrBorrowText'}>
                        {chainMode == Chain.cosmos
                          ? variableBorrowRate.toString()
                          : bigNumberToString(variableBorrowRate, BigNumber.from(25))}
                      </Text>
                      <Text margin={{ top: 'xsmall' }} size="small" color={'clrBorrowText'}>
                        %
                      </Text>
                    </Box>
                    <Text alignSelf="end" color={'clrTextSecondary'} size="small">
                      Borrow {chainMode === Chain.cosmos ? 'APR' : 'APY'}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              pad={{ top: 'xlarge', horizontal: 'large', bottom: 'large' }}
              border={{ side: 'top', color: 'clrBorderGrey' }}
            >
              <Text size="medium1" alignSelf="center" color="clrTextPrimary" className="font-moret">
                Market Stats
              </Text>
              <Box margin={{ top: 'xlarge' }}>
                <Box>
                  <InfoPanelItem
                    align="center"
                    textSize="small"
                    title="Maximum LTV"
                    data={
                      ltv
                        ? [
                          {
                            value: ltv && bigNumberToString(ltv, 2),
                            textSize: 'small',
                          },
                          { value: '%', textSize: 'small' },
                        ]
                        : [{ value: '—', textSize: 'small' }]
                    }
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                  />
                </Box>
                <Box margin={{ top: 'large' }}>
                  <InfoPanelItem
                    align="center"
                    textSize="small"
                    title="Liquidation Threshold"
                    data={
                      liquidationThreshold
                        ? [
                          {
                            value: liquidationThreshold && bigNumberToString(liquidationThreshold, 2),
                            textSize: 'small',
                          },
                          { value: '%', textSize: 'small' },
                        ]
                        : [{ value: '—', textSize: 'small' }]
                    }
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                  />
                </Box>
                <Box margin={{ top: 'large' }}>
                  <InfoPanelItem
                    align="center"
                    textSize="small"
                    title="Liquidation Penalty"
                    data={
                      liquidationBonus
                        ? [
                          {
                            value:
                                chainMode == Chain.cosmos
                                  ? bigNumberToString(liquidationBonus, 2)
                                  : (parseFloat(bigNumberToString(liquidationBonus, 2)) - 100).toFixed(2),
                            textSize: 'small',
                          },
                          { value: '%', textSize: 'small' },
                        ]
                        : [{ value: '—', textSize: 'small' }]
                    }
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                  />
                </Box>
                <Box margin={{ top: 'large' }}>
                  <InfoPanelItem
                    align="center"
                    textSize="small"
                    title="Can be used as collateral?"
                    data={[{ value: canUseAsCollateral ? 'Yes' : 'No', textSize: 'small' }]}
                    justify="between"
                    style={InfoPanelItemStyles.Horizontal}
                  />
                </Box>
              </Box>
              <Box margin={{ top: 'xlarge' }}>
                <Box border={{ color: 'clrBorderGrey' }} pad="medium" round="small">
                  <Box direction="row" align="center">
                    <Image src={Logo} width="17px" alt="umee logo" />
                    <Text size="small" color="clrTextPrimary" className="font-moret" margin={{ left: 'xsmall' }}>
                      Umeeversity
                    </Text>
                  </Box>
                  <Text color="clrTextPrimary" margin={{ top: 'small' }} size="medium">
                    {title}
                  </Text>
                  <Text color="clrTextPrimary" margin={{ top: 'small' }} size="small">
                    {description}
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box direction="row" justify="end" pad={{ horizontal: 'large', bottom: 'large' }}>
              {themeMode === Theme.dark ? (
                <Image width={'75'} src={VectorWhite} alt="umee vector" />
              ) : (
                <Image width={'75'} src={VectorDark} alt="umee vector" />
              )}
            </Box>
            <Box pad={{ vertical: 'xlarge' }} justify="center" className="markets-detail-bottom">
              <Box className="markets-detail-bottom-overlay" />
              <ButtonItem
                round="xlarge"
                margin="auto"
                width={'50%'}
                pad={'0'}
                background="clrBorrow"
                direction="row"
                justify="center"
              >
                <Box onClick={() => loggedIn && setTxnType(ETxnType.deposit)} pad={'medium'}>
                  Supply
                </Box>
                <Box onClick={() => loggedIn && setTxnType(ETxnType.borrow)} pad={{ vertical: 'medium' }}>
                  <Box border={{ side: 'left', color: 'clrDarkGreyOnNavy' }} pad={{ horizontal: 'medium' }}>
                    Borrow
                  </Box>
                </Box>
              </ButtonItem>
            </Box>
            <TransactionModal
              symbol={symbol}
              logo={logo}
              tokenAddress={tokenAddress}
              onClose={() => setTxnType(undefined)}
              txnType={txnType}
            />
          </Box>
        </>
      )}
    </>
  )
}

export default observer(MarketsDetailMobile)

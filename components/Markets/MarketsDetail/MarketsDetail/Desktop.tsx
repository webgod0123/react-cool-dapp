import React, { useContext, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useWeb3 } from 'api/web3'
import { PrimaryBtn } from 'components/common'
import { InfoPanelItem } from 'components/InfoBar'
import InfoCustomMeter from 'components/InfoBar/InfoCustomMeter'
import { InfoPanelItemStyles } from 'components/InfoBar/InfoPanelItem'
import { InfoWindow, InfoWindowBody } from 'components/InfoWindow'
import TokenLogo from 'components/TokenLogo'
import { BigNumber } from 'ethers'
import { Box, ResponsiveContext } from 'grommet'
import { bigNumberToString } from 'lib/number-utils'
import { MarketDetailsBox } from 'pages/markets/MarketDetailsBox'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { useStore } from 'api/cosmosStores'
import { ETxnType } from 'lib/types'
import { observer } from 'mobx-react-lite'
import { MarketsDetailPanelProps } from '.'

const MarketsDetailDesktop = ({ marketsDetail }: { marketsDetail: MarketsDetailPanelProps }) => {
  const history = useHistory()
  const size = useContext(ResponsiveContext)
  const { chainMode } = useChain()
  const { accountStore, chainStore } = useStore()
  const umeeAddress = accountStore.getAccount(chainStore.current.chainId).bech32Address
  const web3 = useWeb3()
  const loggedIn = useMemo(() => {
    let loggedIn = true
    if (chainMode === Chain.cosmos) {
      if (!umeeAddress) loggedIn = false
    } else {
      if (!web3.account) loggedIn = false
    }

    return loggedIn
  }, [chainMode, umeeAddress, web3.account])

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
    logo,
  } = marketsDetail

  return (
    <>
      {marketsDetail && (
        <Box width={'100%'} direction="row" fill="horizontal" alignContent="center" alignSelf="center" align="center">
          <Box width={'100%'} direction="column">
            <InfoWindow flex round="5px">
              <InfoWindowBody
                border={{ size: '1px', color: 'clrSideNavBorder' }}
                round="5px"
                pad={size === 'small' ? 'small' : 'xsmall'}
                background="clrModalBackground"
              >
                <Box round="5px" direction={size === 'small' ? 'column' : 'row'} align="center" justify="center">
                  <Box width={{ min: size !== 'small' ? '190px' : '' }}>
                    <InfoPanelItem
                      title="TOTAL BORROWED"
                      titleBg="clrBoxGradient"
                      titleDirection="row"
                      textSize="xsmall"
                      data={[
                        { value: '$', textSize: 'medium' },
                        {
                          value: Number(totalBorrowedUsd).toLocaleString(),
                          textSize: 'medium',
                        },
                      ]}
                      align={size === 'small' ? 'center' : 'end'}
                    />
                  </Box>
                  <Box style={{ position: 'relative' }}>
                    <InfoCustomMeter value={borrowedPortion} />
                    <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <TokenLogo width="74" height="74" symbol={symbol} src={logo} />
                    </Box>
                  </Box>
                  <Box width={{ min: size !== 'small' ? '190px' : '' }}>
                    <InfoPanelItem
                      title="AVAILABLE LIQUIDITY"
                      titleBg="clrTextPrimary"
                      titleDirection="row-reverse"
                      textSize="xsmall"
                      data={[
                        { value: '$', textSize: 'medium' },
                        {
                          value: Number(availableLiquidityUsd).toLocaleString(),
                          textSize: 'medium',
                        },
                      ]}
                      align={size === 'small' ? 'center' : 'start'}
                    />
                  </Box>
                </Box>
                <Box margin={{ top: size == 'small' ? 'medium' : '' }} direction={'row'} wrap flex justify="around">
                  <Box width={size === 'small' ? '50%' : 'auto'}>
                    <InfoPanelItem
                      align="center"
                      textSize="xsmall"
                      title="MAXIMUM LTV"
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
                      tooltip="Maximum amount that can be borrowed against the asset supplied as collateral."
                    />
                  </Box>
                  <Box width={size === 'small' ? '50%' : 'auto'}>
                    <InfoPanelItem
                      align="center"
                      textSize="xsmall"
                      title="LIQUIDATION THRESHOLD"
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
                      tooltip="The liquidation threshold is the LTV ratio at which a borrower should expect to be liquidated."
                    />
                  </Box>
                  <Box width={size === 'small' ? '50%' : 'auto'}>
                    <InfoPanelItem
                      align="center"
                      textSize="xsmall"
                      title="LIQUIDATION PENALTY"
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
                      tooltip="The liquidation penalty is the fee paid by a borrower in the event that they are liquidated"
                    />
                  </Box>
                  <Box width={size === 'small' ? '50%' : 'auto'}>
                    <InfoPanelItem
                      align="center"
                      textSize="xsmall"
                      title="COLLATERAL"
                      data={[{ value: canUseAsCollateral ? 'Yes' : 'No', textSize: 'small' }]}
                    />
                  </Box>
                </Box>
              </InfoWindowBody>
            </InfoWindow>
            <InfoWindow>
              <InfoWindowBody background="transparent">
                <Box margin={{ top: 'small' }} direction={size === 'small' ? 'column' : 'row'} gap="small" flex>
                  <MarketDetailsBox
                    background="clrModalBackground"
                    borderColor="clrDetailBoxBorderTop1"
                    title={`${ETxnType.deposit} INFORMATION`}
                    textSize="xsmall"
                  >
                    <InfoPanelItem
                      title={`${ETxnType.deposit} Position`}
                      textSize="small"
                      justify="between"
                      style={InfoPanelItemStyles.Horizontal}
                      data={
                        loggedIn
                          ? [
                            {
                              value: bigNumberToString(currentUTokenBalance, decimals),
                              textSize: 'small',
                            },
                            { value: symbol == 'WETH' ? 'ETH' : symbol, textSize: 'small' },
                          ]
                          : [{ value: '—', textSize: 'small' }]
                      }
                    />
                    <InfoPanelItem
                      title="Wallet Balance"
                      textSize="small"
                      justify="between"
                      style={InfoPanelItemStyles.Horizontal}
                      data={
                        loggedIn
                          ? [
                            {
                              value: bigNumberToString(balance, decimals),
                              textSize: 'small',
                            },
                            { value: symbol == 'WETH' ? 'ETH' : symbol, textSize: 'small' },
                          ]
                          : [{ value: '—', textSize: 'small' }]
                      }
                    />
                    <InfoPanelItem
                      title={`${ETxnType.deposit} ${chainMode === Chain.cosmos ? 'APR' : 'APY'}`}
                      textSize="small"
                      justify="between"
                      style={InfoPanelItemStyles.Horizontal}
                      data={[
                        {
                          value:
                            chainMode == Chain.cosmos
                              ? liquidityRate.toString()
                              : bigNumberToString(liquidityRate, BigNumber.from(25)),
                          textSize: 'small',
                        },
                        { value: '%', textSize: 'small' },
                      ]}
                    />

                    <Box margin={{ top: 'medium' }} direction="row" justify="center">
                      <PrimaryBtn
                        fullWidth
                        text={ETxnType.deposit}
                        pad={{ vertical: 'xsmall' }}
                        textSize="medium"
                        round="medium"
                        disabled={!loggedIn}
                        onClick={() =>
                          history.push({
                            pathname: '/dashboard',
                            state: {
                              tokenAddress: tokenAddress,
                              symbol: symbol,
                              txnType: ETxnType.deposit,
                              logo: logo,
                            },
                          })
                        }
                      />
                    </Box>
                  </MarketDetailsBox>
                  <MarketDetailsBox
                    background="clrModalBackground"
                    borderColor="clrDetailBoxBorderTop3"
                    title={`${ETxnType.borrow} INFORMATION`}
                    textSize="xsmall"
                  >
                    <InfoPanelItem
                      title={`${ETxnType.borrow} Position`}
                      textSize="small"
                      justify="between"
                      style={InfoPanelItemStyles.Horizontal}
                      data={
                        loggedIn
                          ? [
                            {
                              value: bigNumberToString(currentVariableDebt.add(currentStableDebt), decimals),
                              textSize: 'small',
                            },
                            { value: symbol == 'WETH' ? 'ETH' : symbol, textSize: 'small' },
                          ]
                          : [{ value: '—', textSize: 'small' }]
                      }
                    />
                    <InfoPanelItem
                      title="Available"
                      textSize="small"
                      justify="between"
                      style={InfoPanelItemStyles.Horizontal}
                      data={
                        loggedIn
                          ? [
                            {
                              value: bigNumberToString(availableBorrowAmount, decimals),
                              textSize: 'small',
                            },
                            { value: symbol == 'WETH' ? 'ETH' : symbol, textSize: 'small' },
                          ]
                          : [{ value: '—', textSize: 'small' }]
                      }
                    />
                    <InfoPanelItem
                      title={`${ETxnType.borrow} ${chainMode === Chain.cosmos ? 'APR' : 'APY'}`}
                      textSize="small"
                      justify="between"
                      style={InfoPanelItemStyles.Horizontal}
                      data={[
                        {
                          value:
                            chainMode == Chain.cosmos
                              ? variableBorrowRate.toString()
                              : bigNumberToString(variableBorrowRate, BigNumber.from(25)),
                          textSize: 'small',
                        },
                        { value: '%', textSize: 'small' },
                      ]}
                    />
                    <Box margin={{ top: 'medium' }} direction="row" justify="center">
                      <PrimaryBtn
                        fullWidth
                        text={ETxnType.borrow}
                        pad={{ vertical: 'xsmall' }}
                        textSize="medium"
                        round="medium"
                        disabled={!loggedIn}
                        onClick={() =>
                          history.push({
                            pathname: '/dashboard',
                            state: { tokenAddress: tokenAddress, symbol: symbol, txnType: ETxnType.borrow, logo: logo },
                          })
                        }
                      />
                    </Box>
                  </MarketDetailsBox>
                </Box>
              </InfoWindowBody>
            </InfoWindow>
          </Box>
        </Box>
      )}
    </>
  )
}

export default observer(MarketsDetailDesktop)

import React, { useMemo } from 'react'
import { Box, Text } from 'grommet'
import { ETxnType } from 'lib/types'
import HoverEffect from '../HoverEffect'
import { Next } from 'grommet-icons'
import { useStore } from 'api/cosmosStores'
import { Chains } from '../../../config'
import { Chain, useChain } from 'lib/hooks/chain/context'

type MenuItem = {
  title: string
  desc: string
  type: ETxnType
}

interface BottomMenuProps {
  items: ETxnType[]
  symbol: string
  onClickMenu: (type: ETxnType) => void
}

const BottomMenu = ({ items, symbol, onClickMenu }: BottomMenuProps) => {
  const { chainStore } = useStore()
  const { chainMode } = useChain()
  
  const chainName = useMemo(() => {
    let chainName = ''
    if (chainMode === Chain.cosmos) {
      const chainId = Chains[symbol]
      chainName = chainStore.getChain(chainId).chainName
    }
    return chainName
  }, [chainMode, chainStore, symbol])

  const menus: MenuItem[] = [
    {
      title: 'Transfer',
      desc: `Transfer ${symbol} to/from the ${chainName}`,
      type: ETxnType.transfer,
    },
    {
      title: 'Bridge to Umee',
      desc: `Bridge ${symbol} to your Umee wallet`,
      type: ETxnType.bridgeToUmee,
    },
    {
      title: 'Bridge to Ethereum',
      desc: `Bridge ${symbol} to your Ethereum wallet`,
      type: ETxnType.bridgeToEthereum,
    },
    {
      title: `Send to ${symbol} Hub`,
      desc: `Send ${symbol} to your native wallet`,
      type: ETxnType.ibcToCosmos,
    },
    {
      title: 'Send to Umee',
      desc: `Send ${symbol} to your Umee wallet`,
      type: ETxnType.ibcToUmee,
    },
    {
      title: 'Supply',
      desc: `Provide ${symbol} to earn interest`,
      type: ETxnType.deposit,
    },
    {
      title: 'Withdraw',
      desc: `Withdraw ${symbol} you have supplied`,
      type: ETxnType.withdraw,
    },
    {
      title: 'Borrow',
      desc: `Borrow ${symbol} at a low interest rate`,
      type: ETxnType.borrow,
    },
    {
      title: 'Repay',
      desc: `Repay ${symbol} you’ve borrowed`,
      type: ETxnType.repay,
    },
    {
      title: 'Market Information',
      desc: `View information about the ${symbol} market`,
      type: ETxnType.markets,
    },
    {
      title: 'Astrolabe',
      desc: `View ${symbol} advanced analytics`,
      type: ETxnType.markets,
    },
  ]

  const getMenu = (type: ETxnType) => {
    if (!type) return

    const menu = menus.find((menu) => menu.type === type)
    return menu
  }

  return (
    <>
      {items.map((item, key) => {
        const menu = getMenu(item)

        return (
          menu && (
            <React.Fragment key={key}>
              <HoverEffect
                onClick={() => onClickMenu(item)}
                pad={{ horizontal: 'large' }}
                style={{ maxWidth: 'initial' }}
              >
                <Box
                  flex
                  direction="row"
                  justify="between"
                  align="center"
                  border={key < items.length - 1 && { size: '1px', color: 'clrBorderGrey', side: 'bottom' }}
                  pad={{ vertical: 'medium' }}
                >
                  <Box>
                    <Text color="clrTextPrimary" size="medium">
                      {menu.title}
                    </Text>
                    <Text color="clrTextGrey" size="small">
                      {menu.desc}
                    </Text>
                  </Box>
                  <Next size="16px" color="clrTextGrey" />
                </Box>
              </HoverEffect>
            </React.Fragment>
          )
        )
      })}
    </>
  )
}

export default BottomMenu

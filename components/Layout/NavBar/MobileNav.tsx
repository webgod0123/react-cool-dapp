import { Box, ResponsiveContext, Text } from 'grommet'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ToggleSwitch } from 'components/Switches'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { Modal } from 'components/common/Modals/CommonModal'
import ConnectWallet from 'components/ConnectWallet/ConnectWallet'

const MobileNav = ({ navOpen, close }: { navOpen: boolean; close: () => void }) => {
  const menus = [
    {
      title: 'Markets',
      url: '/markets',
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
    },
    { title: 'Stake', url: '/stake' },
    { title: 'Vote', url: '/governance' },
    { title: 'Analytics', link: 'https://astrolabe.umee.cc/' },
  ]

  const { chainMode, setChainMode } = useChain()
  const size = useContext(ResponsiveContext)

  return navOpen ? (
    <Modal position="top" fullwidth onClose={() => close()} margin={{ top: '60px' }}>
      <Box width={'100%'} background="#16183C" className="mobile-menu">
        <Box
          pad={size === 'small' ? 'large' : 'medium'}
          border={{ side: 'bottom', size: '1px', color: 'clrDarkGreyOnNavy' }}
        >
          <Text size="small" color={'clrIconOff'}>
            Menu
          </Text>
          <Box margin={{ top: 'small' }}>
            {menus.map((menu, index) => (
              <Box pad={{ bottom: '24px' }} key={index}>
                {menu.url && (
                  <Link onClick={() => close()} to={menu.url}>
                    <Text size="small" color="clrWhite">
                      {menu.title}
                    </Text>
                  </Link>
                )}
                {menu.link && (
                  <a onClick={() => close()} href={menu.link} target="_blank" rel="noreferrer">
                    <Text size="small" color="clrWhite">
                      {menu.title}
                    </Text>
                  </a>
                )}
              </Box>
            ))}
          </Box>
          <Box width={'100%'}>
            <ConnectWallet />
          </Box>
        </Box>
        <Box
          pad={size === 'small' ? 'large' : 'medium'}
          border={{ side: 'bottom', size: '1px', color: 'clrDarkGreyOnNavy' }}
        >
          <Text size="small" color={'clrIconOff'}>
            Settings
          </Text>
          <Box margin={{ top: 'small' }}>
            <Box direction="row" justify="between" align="center" margin={{ bottom: '20px' }}>
              <Text size="small" color="clrWhite">
                Network
              </Text>
              <ToggleSwitch
                isMobile
                choiceB={Chain.ethereum}
                choiceA={Chain.cosmos}
                defaultSelected={chainMode}
                handler={(chain) => setChainMode(chain)}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  ) : null
}

export default MobileNav

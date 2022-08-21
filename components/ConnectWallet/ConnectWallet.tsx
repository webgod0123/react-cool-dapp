import * as React from 'react'
import { Box, ResponsiveContext, Text, Image } from 'grommet'
import { useStore } from '../../api/cosmosStores'
import './ConnectWallet.css'
import GradientBox from 'components/common/GradientBox/GradientBox'
import { observer } from 'mobx-react-lite'
import { PrimaryBtn } from 'components/common'
import SignOutIcon from '../../public/images/sidebar/sign-out.png'
import { Chain, useChain } from 'lib/hooks/chain/context'
import { useWeb3 } from 'api/web3'
import { connect } from 'api/web3/providers'
import truncate from 'lib/truncate'
import { Theme } from 'lib/hooks/theme/context'
import { useAccountConnection } from 'api/cosmosStores/account-init-management'

const ConnectWallet = () => {
  const { disconnectAccount, connectAccount } = useAccountConnection()
  const { accountStore, chainStore } = useStore()
  const umeeAccount = accountStore.getAccount(chainStore.current.chainId)
  const size = React.useContext(ResponsiveContext)
  const web3 = useWeb3()
  const { chainMode } = useChain()

  const accountConnected = React.useMemo(() => {
    let connected: boolean = false
    if (chainMode === Chain.cosmos && umeeAccount.bech32Address) connected = true
    if (chainMode === Chain.ethereum && web3.account) connected = true
    return connected
  }, [chainMode, umeeAccount.bech32Address, web3.account])

  const connectToAccount = () => {
    chainMode === Chain.ethereum ? connect() : connectAccount()
  }

  return (
    <>
      {accountConnected ? (
        <GradientBox
          pad={size === 'small' ? 'medium' : { vertical: '14px', horizontal: 'large' }}
          onClick={chainMode === Chain.cosmos ? disconnectAccount : web3.disconnect}
          defaultTheme={Theme.dark}
        >
          <Box direction="row" justify={size === 'small' || size === 'medium' ? 'between' : 'center'} align="center">
            <Text alignSelf="center" size={'small'} color={'clrWhite'}>
              {chainMode === Chain.cosmos
                ? umeeAccount.name
                : size === 'small'
                  ? truncate(web3.account, 11, 5)
                  : truncate(web3.account, 5, 2)}
            </Text>
            {(size === 'small' || size === 'medium') && <Image width={'30px'} src={SignOutIcon} alt="sign out" />}
          </Box>
        </GradientBox>
      ) : (
        <PrimaryBtn
          pad={size === 'small' ? 'medium' : { vertical: '16px', horizontal: 'large' }}
          textSize={'small'}
          text="Connect"
          round="xlarge"
          onClick={() => connectToAccount()}
        />
      )}
    </>
  )
}

export default observer(ConnectWallet)
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from './index'
import { getKeplrFromWindow, WalletStatus } from '@keplr-wallet/stores'

import { KeplrWalletConnectV1 } from '@keplr-wallet/wc-client'
import { useKeplr } from 'lib/hooks/useKeplr'

import { Registry } from '@cosmjs/proto-signing'
import { defaultRegistryTypes, SigningStargateClient } from '@cosmjs/stargate'
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js'

/** Manages the initialization of the Umee account. */

export interface AccountConnection {
  isAccountConnected: boolean
  disconnectAccount: () => Promise<void>
  connectAccount: () => void
  stargateClient: SigningStargateClient | undefined
}

export const AccountConnectionContext = React.createContext<AccountConnection | null>(null)

export default observer(({ children }) => {
  const { chainStore, accountStore } = useStore()

  const keplr = useKeplr()

  const chainInfo = chainStore.current
  const account = accountStore.getAccount(chainInfo.chainId)

  // This is for main net after release the main net
  const mainAccount = accountStore.getAccount('umee-1')

  const [accountHasInit, setAccountHasInit] = useState(false)
  const [stargateClient, setStargateClient] = useState<SigningStargateClient>()

  const isAccountConnected = account.walletStatus === WalletStatus.Loaded

  const disconnectAccount = useCallback(async () => {
    account.disconnect()
  }, [account])

  useEffect(() => {
    // Initially, try to get keplr from window, and keplr's mode is "mobile-web",
    // it means that user enters the website via keplr app's in app browser.
    // And, it means explicitly press the Umee button on the keplr's dApps introduction page.
    // So, try to init account immediately.
    getKeplrFromWindow().then((keplr) => {
      if (keplr && keplr.mode === 'mobile-web') {
        connectAccount()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Init Umee account w/ desired connection type (wallet connect, extension)
  // if prev connected Keplr in this browser.
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const value = localStorage.getItem('account_auto_connect')
      if (value) {
        if (value === 'wallet-connect') {
          keplr.setDefaultConnectionType('wallet-connect')
        } else {
          keplr.setDefaultConnectionType('extension')
        }
        connectAccount()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const listenWCDisconnectEventOnce = useRef(false)
  useEffect(() => {
    if (account.walletStatus === WalletStatus.Loaded) {
      account.getKeplr().then((keplr) => {
        // For WalletConnect, all accounts are released at "disconnect" event
        // TODO: Disconnection of WalletConnect is handled here,
        //       but most of the logic for WalletConnect is in the `useKeplr()` hook.
        //       WalletConnect related logic should be modified so that it can be in one place.
        if (keplr instanceof KeplrWalletConnectV1) {
          if (!listenWCDisconnectEventOnce.current) {
            listenWCDisconnectEventOnce.current = true

            keplr.connector.on('disconnect', () => {
              chainStore.chainInfos.forEach((chainInfo) => {
                if (accountStore.hasAccount(chainInfo.chainId)) {
                  accountStore.getAccount(chainInfo.chainId).disconnect()
                }
              })
            })
          }
        }
      })
    }
  }, [account, account.walletStatus, accountStore, chainStore.chainInfos])

  // React to changes in Umee account state; store desired connection type in browser
  // clear Keplr sessions, disconnect account.
  useEffect(() => {
    if (account.walletStatus === WalletStatus.Loaded) {
      setAccountHasInit(true)
      if (typeof localStorage !== 'undefined') {
        const value = keplr.connectionType === 'wallet-connect' ? 'wallet-connect' : 'extension'
        localStorage.setItem('account_auto_connect', value)
      }
    }

    if (accountHasInit && account.walletStatus === WalletStatus.NotInit) {
      setAccountHasInit(false)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('account_auto_connect')
      }
      keplr.getKeplr().then((keplrAPI) => {
        if (keplrAPI && keplrAPI instanceof KeplrWalletConnectV1) {
          keplrAPI.connector.killSession().catch((e) => {
            console.log(e)
          })
        }

        keplr.clearLastUsedKeplr()
        keplr.setDefaultConnectionType(undefined)
      })
    }

    if (account.walletStatus === WalletStatus.Rejected || account.walletStatus === WalletStatus.NotExist) {
      disconnectAccount()
    }
  }, [account, account.walletStatus, accountHasInit, disconnectAccount, keplr])

  const connectAccount = useCallback(async () => {
    account.init()

    mainAccount.init()

    const keplr = await mainAccount.getKeplr()

    if (!keplr) return
    const registry = new Registry()

    registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant)
    registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke)

    defaultRegistryTypes.forEach((v) => {
      registry.register(v[0], v[1])
    })

    const offlineSigner = keplr.getOfflineSigner('umee-1')

    const stargateClient = await SigningStargateClient.connectWithSigner(
      // chainInfo.rpc,
      chainStore.getChain('umee-1').rpc,
      offlineSigner,
      {
        registry: registry,
      },
    )

    setStargateClient(stargateClient)
  }, [account, chainStore, mainAccount])

  return (
    <AccountConnectionContext.Provider
      value={{ isAccountConnected, stargateClient, connectAccount, disconnectAccount }}
    >
      {children}
    </AccountConnectionContext.Provider>
  )
})

export function useAccountConnection() {
  const context = useContext(AccountConnectionContext)
  if (!context) {
    throw new Error('You forgot to use AccountConnectionProvider')
  }
  return context
}

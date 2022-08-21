import { coins, StdFee } from '@cosmjs/stargate'
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx.js'
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz'
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp'
import moment from 'moment'
import { useAccountConnection } from 'api/cosmosStores/account-init-management'
import { useStore } from 'api/cosmosStores'
import { displayToast, TToastType } from 'components/common/toasts'
import { OperatorGrant } from 'api/stake/data'
import { toast } from 'react-toastify'

export const useAuthz = () => {
  const { stargateClient } = useAccountConnection()
  const { accountStore, chainStore } = useStore()
  const account = accountStore.getAccount('umee-1')
  const chain = chainStore.getChain('umee-1')

  const defaultExpiry = moment().add(5, 'year')

  const sendGrantMsgs = async (grantee: string, granter: string, operatorAddress: string, onFulFilled: () => void) => {
    const msg: MsgGrant = {
      granter,
      grantee,
      grant: {
        authorization: {
          typeUrl: '/cosmos.staking.v1beta1.StakeAuthorization',
          value: StakeAuthorization.encode(
            StakeAuthorization.fromPartial({
              allowList: { address: [operatorAddress] },
              maxTokens: undefined,
              authorizationType: 1,
            }),
          ).finish(),
        },
        expiration: Timestamp.fromPartial({
          seconds: defaultExpiry.unix(),
          nanos: 0,
        }),
      },
    }

    const msgAny = {
      typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
      value: msg,
    }

    const fee = {
      amount: coins(0, chain.stakeCurrency.coinMinimalDenom),
      gas: '140000',
    }

    await sendMsgs([msgAny], fee, onFulFilled, 'Enabling Auto Compound')
  }

  const sendRevokeMsgs = async (grantee: string, granter: string, grants: OperatorGrant, onFulFilled: () => void) => {
    const msg: MsgRevoke = {
      granter: granter,
      grantee: grantee,
      msgTypeUrl: grants.stakeGrant
        ? '/cosmos.staking.v1beta1.MsgDelegate'
        : '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    }

    const msgAny = {
      typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
      value: msg,
    }

    const fee = {
      amount: coins(0, chain.stakeCurrency.coinMinimalDenom),
      gas: '140000',
    }

    await sendMsgs([msgAny], fee, onFulFilled, 'Disabling Auto Compound')
  }

  const sendMsgs = async (msgAny: any, fee: StdFee, onFulFilled: () => void, message?: string) => {
    if (!stargateClient) return

    displayToast(
      message || '',
      TToastType.TX_BROADCASTING,
      { message: '' },
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      },
    )

    stargateClient.signAndBroadcast(account.bech32Address, msgAny, fee).then(
      (res) => {
        if (!res.code) {
          dismissToast()
          onFulFilled()
          displayToast('Transaction Included in the Block', TToastType.TX_SUCCESSFUL, {
            customLink: chain.raw.explorerUrlToTx.replace('{txHash}', res.transactionHash.toUpperCase()),
          })
        }
      },
      (error) => {
        let msg = 'Transaction Failed'
        if (error.message === 'Data is invalid : Unexpected characters') msg = 'Feature not supported on Ledger'
        dismissToast()
        displayToast(msg, TToastType.TX_FAILED, { message: error.message })
      },
    )
  }

  const dismissToast = () => {
    toast.dismiss()
  }

  return { sendGrantMsgs, sendRevokeMsgs }
}

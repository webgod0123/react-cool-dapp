/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { IDelegationToken } from "./IDelegationToken";

export class IDelegationTokenFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDelegationToken {
    return new Contract(address, _abi, signerOrProvider) as IDelegationToken;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

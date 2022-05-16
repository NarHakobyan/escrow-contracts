import { TransactionResponse } from '@ethersproject/providers';
import { ethers } from 'hardhat';
import { constants, time } from './prelude';
import BN from 'bn.js';
import { BigNumber } from 'ethers';

export async function timeIncreaseTo(seconds: number | string | BN) {
  const delay = 1000 - new Date().getMilliseconds();
  await new Promise((resolve) => setTimeout(resolve, delay));
  await time.increaseTo(seconds);
}

export async function trackReceivedTokenAndTx<T extends unknown[]>(
  token:
    | any // | Token
    | { address: typeof constants.ZERO_ADDRESS }
    | { address: typeof constants.EEE_ADDRESS },
  wallet: string,
  txPromise: (...args: T) => Promise<TransactionResponse>,
  ...args: T
) {
  const [balanceFunc, isETH] =
    'balanceOf' in token
      ? [() => token.balanceOf(wallet), false]
      : [async () => await ethers.provider.getBalance(wallet), true];
  const preBalance = await balanceFunc();
  const txResult = await txPromise(...args);
  const block = await ethers.provider.getBlock(txResult.blockHash!);
  const txFees =
    wallet.toLowerCase() === txResult.from.toLowerCase() && isETH
      ? block.gasUsed.mul(txResult.gasPrice!)
      : BigNumber.from(0);
  const postBalance = await balanceFunc();
  return [postBalance.sub(preBalance).add(txFees), txResult] as const;
}

export function fixSignature(signature: string) {
  // in geth its always 27/28, in ganache its 0/1. Change to 27/28 to prevent
  // signature malleability if version is 0/1
  // see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
  let v = parseInt(signature.slice(130, 132), 16);
  if (v < 27) {
    v += 27;
  }
  const vHex = v.toString(16);
  return signature.slice(0, 130) + vHex;
}

// signs message in node (ganache auto-applies "Ethereum Signed Message" prefix)
// export async function signMessage(signer: string, messageHex = '0x') {
//   return fixSignature(await ethers.eth.sign(messageHex, signer));
// }

export async function countInstructions(...args: any[]) {
  return [];
}

// export async function countInstructions(
//   txHash: string,
//   instructions: string[],
// ) {
//   if (
//     !web3.currentProvider ||
//     typeof web3.currentProvider === 'string' ||
//     !web3.currentProvider.send
//   ) {
//     throw new Error('Unsupported provider');
//   }
//   const trace = await promisify(
//     web3.currentProvider.send.bind(web3.currentProvider),
//   )({
//     jsonrpc: '2.0',
//     method: 'debug_traceTransaction',
//     params: [txHash, {}],
//     id: new Date().getTime(),
//   });

//   const str = JSON.stringify(trace);

//   return instructions.map((instr) => {
//     return str.split('"' + instr.toUpperCase() + '"').length - 1;
//   });
// }

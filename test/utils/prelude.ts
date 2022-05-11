import { toBN, toWei } from 'web3-utils';
import BN from 'bn.js';
import { time as timeImpl } from '@openzeppelin/test-helpers';

export const constants = {
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  EEE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  ZERO_BYTES32:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  MAX_UINT256: toBN('2').pow(toBN('256')).sub(toBN('1')).toString(),
  MAX_INT256: toBN('2').pow(toBN('255')).sub(toBN('1')).toString(),
  MIN_INT256: toBN('2').pow(toBN('255')).mul(toBN('-1')).toString(),
} as const;

// test-helpers
export type Time = {
  increaseTo: (target: string | number | BN) => Promise<BN>;
  latest: () => Promise<BN>;
};

export const time: Time = timeImpl;

export function ether(n: string) {
  return toBN(toWei(n, 'ether'));
}

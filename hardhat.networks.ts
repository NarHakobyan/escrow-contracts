import * as dotenv from 'dotenv';
import { NetworksUserConfig } from 'hardhat/types';

dotenv.config();

const networks: NetworksUserConfig = {};

function register(
  name: string,
  chainId: number,
  url?: string,
  privateKey?: string,
) {
  if (url && privateKey) {
    networks[name] = {
      url,
      chainId,
      accounts: [privateKey],
    };
    console.log(`Network '${name}' registered`);
  }
}

register('mainnet', 1, process.env.MAINNET_RPC_URL, process.env.PRIVATE_KEY);
register('bsc', 56, process.env.BSC_RPC_URL, process.env.PRIVATE_KEY);
register('kovan', 42, process.env.KOVAN_RPC_URL, process.env.PRIVATE_KEY);
register(
  'optimistic',
  10,
  process.env.OPTIMISTIC_RPC_URL,
  process.env.PRIVATE_KEY,
);
register(
  'kovan-optimistic',
  69,
  process.env.KOVAN_OPTIMISTIC_RPC_URL,
  process.env.PRIVATE_KEY,
);
register('matic', 137, process.env.MATIC_RPC_URL, process.env.PRIVATE_KEY);
register(
  'arbitrum',
  42161,
  process.env.ARBITRUM_RPC_URL,
  process.env.PRIVATE_KEY,
);
register('ropsten', 3, process.env.ROPSTEN_RPC_URL, process.env.PRIVATE_KEY);
register('xdai', 100, process.env.XDAI_RPC_URL, process.env.XDAI_PRIVATE_KEY);
register('avax', 43114, process.env.AVAX_RPC_URL, process.env.AVAX_PRIVATE_KEY);

export default networks;

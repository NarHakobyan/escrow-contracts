import {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from './../helper-hardhat-config';
import { verify } from './../lib/verify';
import { network } from 'hardhat';

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log('----------------------------------------------------');
  const args = [];
  const cryptip = await deploy('CrypTip', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...');
    await verify(cryptip.address, args);
  }
  log('----------------------------------------------------');
};

module.exports.tags = ['all', 'cryptip'];

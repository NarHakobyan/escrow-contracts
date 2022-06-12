import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';

task('block-number', 'Prints the current block number').setAction(
  async (taskArgs, hre) => {
    await hre.ethers.provider.getBlockNumber().then((blockNumber) => {
      console.log(`Current block number: ${blockNumber}`);
    });
  },
);

module.exports = {};

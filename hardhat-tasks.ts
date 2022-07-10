import { task, types } from 'hardhat/config';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getContract } from './lib/contract';
import { env } from './lib/env';
import { Contract } from 'ethers';

task('block-number', 'Prints the current block number').setAction(
  async (taskArgs, hre) => {
    await hre.ethers.provider.getBlockNumber().then((blockNumber) => {
      console.log(`Current block number: ${blockNumber}`);
    });
  },
);

task('deploy-contract', 'Deploy NFT contract').setAction(async (_, hre) => {
  return hre.ethers
    .getContractFactory('MyNFT', getWallet())
    .then((contractFactory) => contractFactory.deploy())
    .then((result) => {
      process.stdout.write(`Contract address: ${result.address}`);
    });
});

task('mint-nft', 'Mint an NFT')
  .addParam('tokenUri', 'Your ERC721 Token URI', undefined, types.string)
  .setAction(async (tokenUri, hre) => {
    return getContract('MyNFT', hre)
      .then((contract: Contract) => {
        return contract.mintNFT(env('ETH_PUBLIC_KEY'), tokenUri, {
          gasLimit: 500_000,
        });
      })
      .then((tr: TransactionResponse) => {
        process.stdout.write(`TX hash: ${tr.hash}`);
      });
  });
function getWallet(): any {
  throw new Error('Function not implemented.');
}

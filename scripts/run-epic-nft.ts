import { ethers } from 'hardhat';

async function run() {
  const MyEpicNFTFactory = await ethers.getContractFactory('MyEpicNFT');
  const byEpicNFT = await MyEpicNFTFactory.deploy();
  await byEpicNFT.deployed();
  console.log('Contract addy:', byEpicNFT.address);

  const [owner] = await ethers.getSigners();
}

run();

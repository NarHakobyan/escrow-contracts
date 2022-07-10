import { ethers } from 'hardhat';

async function main() {
  const waveContractFactory = await ethers.getContractFactory('WavePortal');
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();
  console.log('Contract addy:', waveContract.address);

  const waveCount = await waveContract.getTotalWaves();
  console.log(waveCount.toNumber());

  /**
   * Let's send a few waves!
   */
  let waveTxn = await waveContract.wave('A message!');
  await waveTxn.wait(); // Wait for the transaction to be mined

  const [, randomPerson] = await ethers.getSigners();
  waveTxn = await waveContract.connect(randomPerson).wave('Another message!');
  await waveTxn.wait(); // Wait for the transaction to be mined

  const allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
}

main();

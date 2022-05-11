import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AddressUtilsMock } from '../../typechain';

describe('address utils', () => {
  let addressUtils: AddressUtilsMock;
  let ownerAddress: string;

  beforeEach(async () => {
    const addressUtilsContract = await ethers.getContractFactory(
      'AddressUtilsMock',
    );
    addressUtils = await addressUtilsContract.deploy();
    const [owner] = await ethers.getSigners();
    ownerAddress = owner.address;
    await addressUtils.deployed();
  });

  it('correctly checks account', async function () {
    expect(await addressUtils.isContract(ownerAddress)).to.equal(false);
  });

  it('correctly checks smart contract', async function () {
    const contract = await ethers.getContractFactory('NFTokenTestMock');
    const nfToken = await contract.deploy();
    await nfToken.deployed();
    expect(await addressUtils.isContract(nfToken.address)).to.equal(true);
  });
});

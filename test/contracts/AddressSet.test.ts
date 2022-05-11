import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AddressSetMock } from '../../typechain';
import { constants } from '../src/utils/prelude';

describe('AddressSet', function () {
  let addressSetMock: AddressSetMock;
  let address1: string;
  let address2: string;
  let address3: string;

  beforeEach(async function () {
    const AddressSetMock = await ethers.getContractFactory('AddressSetMock');
    const [, wallet1, wallet2, wallet3] = await ethers.getSigners();

    address1 = await wallet1.getAddress();
    address2 = await wallet2.getAddress();
    address3 = await wallet3.getAddress();

    addressSetMock = await AddressSetMock.deploy();
  });

  describe('length', async function () {
    it('should be calculate length 0', async function () {
      expect(await addressSetMock.length()).to.be.equal('0');
    });

    it('should be calculate length 1', async function () {
      await addressSetMock.add(address1);
      expect(await addressSetMock.length()).to.be.equal('1');
    });
  });

  describe('at', async function () {
    it('should be get from empty data', async function () {
      expect(await addressSetMock.at(0)).to.be.equal(constants.ZERO_ADDRESS);
      expect(await addressSetMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
    });

    it('should be get from data with 1 element', async function () {
      await addressSetMock.add(address1);
      expect(await addressSetMock.at(0)).to.be.equal(address1);
      expect(await addressSetMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
    });

    it('should be get from data with several elements', async function () {
      await addressSetMock.add(address1);
      await addressSetMock.add(address2);
      expect(await addressSetMock.at(0)).to.be.equal(address1);
      expect(await addressSetMock.at(1)).to.be.equal(address2);
    });
  });

  describe('contains', async function () {
    it('should be not contains in empty data', async function () {
      expect(await addressSetMock.contains(address1)).to.be.equal(false);
      expect(await addressSetMock.contains(address2)).to.be.equal(false);
      expect(await addressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(
        false,
      );
    });

    it('should be contains address', async function () {
      await addressSetMock.add(address1);
      expect(await addressSetMock.contains(address1)).to.be.equal(true);
      expect(await addressSetMock.contains(address2)).to.be.equal(false);
      expect(await addressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(
        false,
      );
    });

    it('should be contains addresses', async function () {
      await addressSetMock.add(address1);
      await addressSetMock.add(address2);
      expect(await addressSetMock.contains(address1)).to.be.equal(true);
      expect(await addressSetMock.contains(address2)).to.be.equal(true);
      expect(await addressSetMock.contains(address3)).to.be.equal(false);
      expect(await addressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(
        false,
      );
    });
  });

  describe('add', async function () {
    it('should be add to empty data', async function () {
      const isAdded = await addressSetMock.callStatic.add(address1);
      await addressSetMock.add(address1);
      expect(await addressSetMock.contains(address1)).to.be.equal(isAdded);
    });

    it('should not be add a double element without another elements in data', async function () {
      await addressSetMock.add(address1);
      expect(await addressSetMock.callStatic.add(address1)).to.be.equal(false);
    });

    it('should be add to data with 1 element', async function () {
      await addressSetMock.add(address1);
      const isAdded = await addressSetMock.callStatic.add(address2);
      await addressSetMock.add(address2);
      expect(await addressSetMock.contains(address2)).to.be.equal(isAdded);
    });

    it('should not be add a double element with another elements in data', async function () {
      await addressSetMock.add(address1);
      await addressSetMock.add(address2);
      expect(await addressSetMock.callStatic.add(address2)).to.be.equal(false);
    });
  });

  describe('remove', async function () {
    it('should not be remove from empty data', async function () {
      const isRemoved = await addressSetMock.callStatic.remove(address1);
      expect(isRemoved).to.be.equal(false);
    });

    it('should be remove from data', async function () {
      await addressSetMock.add(address1);
      const isRemoved = await addressSetMock.callStatic.remove(address1);
      await addressSetMock.remove(address1);
      expect(isRemoved).to.be.equal(true);
      expect(await addressSetMock.contains(address1)).to.be.equal(false);
    });

    it('should not be remove element which is not in data', async function () {
      await addressSetMock.add(address1);
      const isRemoved = await addressSetMock.callStatic.remove(address2);
      expect(isRemoved).to.be.equal(false);
    });

    it('should be remove from data and keep the remainder', async function () {
      await addressSetMock.add(address1);
      await addressSetMock.add(address2);
      const isRemoved = await addressSetMock.callStatic.remove(address1);
      await addressSetMock.remove(address1);
      expect(isRemoved).to.be.equal(true);
      expect(await addressSetMock.contains(address1)).to.be.equal(false);
      expect(await addressSetMock.contains(address2)).to.be.equal(true);
    });
  });
});

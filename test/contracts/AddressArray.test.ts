import { AddressArrayMock } from './../../typechain/AddressArrayMock.d';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { constants } from '../src/utils/prelude';

describe.only('AddressArray', function () {
  let addressArrayMock: AddressArrayMock;
  let address1: string;
  let address2: string;
  let address3: string;

  beforeEach(async function () {
    const AddressArrayMock = await ethers.getContractFactory(
      'AddressArrayMock',
    );
    const [wallet1, wallet2, wallet3] = await ethers.getSigners();
    address1 = await wallet1.getAddress();
    address2 = await wallet2.getAddress();
    address3 = await wallet3.getAddress();
    addressArrayMock = await AddressArrayMock.deploy();
  });

  describe('length', async function () {
    it('should be calculate length 0', async function () {
      expect(await addressArrayMock.length()).to.be.equal('0');
    });

    it('should be calculate length 1', async function () {
      await addressArrayMock.push(address1);
      expect(await addressArrayMock.length()).to.be.equal('1');
    });
  });

  describe('at', async function () {
    it('should be get from empty data', async function () {
      expect(await addressArrayMock.at(0)).to.be.equal(constants.ZERO_ADDRESS);
      expect(await addressArrayMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
    });

    it('should be get from data with 1 element', async function () {
      await addressArrayMock.push(address1);
      expect(await addressArrayMock.at(0)).to.be.equal(address1);
      expect(await addressArrayMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
    });

    it('should be get from data with several elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      expect(await addressArrayMock.at(0)).to.be.equal(address1);
      expect(await addressArrayMock.at(1)).to.be.equal(address2);
    });
  });

  describe('get', async function () {
    it('should be get empty data', async function () {
      expect(await addressArrayMock.get()).to.eql([]);
    });

    it('should be get from data with 1 element', async function () {
      await addressArrayMock.push(address1);
      expect(await addressArrayMock.get()).to.eql([address1]);
    });

    it('should be get from data with several elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      expect(await addressArrayMock.get()).to.eql([
        address1,
        address2,
      ]);
    });
  });

  describe('push', async function () {
    it('should be push to empty data', async function () {
      const pushedIndex = await addressArrayMock.callStatic.push(
        address1,
      );

      await addressArrayMock.push(address1);
      const val = await addressArrayMock.at(pushedIndex.sub(1));
      console.log(val);
      expect(val).to.be.equal(address1);
    });

    it('should be push to data with 1 element', async function () {
      await addressArrayMock.push(address1);
      const pushedIndex = await addressArrayMock.callStatic.push(
        address2,
      );
      await addressArrayMock.push(address2);
      expect(await addressArrayMock.at(pushedIndex.sub(1))).to.be.equal(
        address2,
      );
    });

    it('should be get push to data with several elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      const pushedIndex = await addressArrayMock.callStatic.push(
        address3,
      );
      await addressArrayMock.push(address3);
      expect(await addressArrayMock.at(pushedIndex.sub(1))).to.be.equal(
        address3,
      );
    });
  });

  describe('pop', async function () {
    it('should be thrown when data is empty', async function () {
      await expect(addressArrayMock.pop()).to.eventually.be.rejectedWith(
        'PopFromEmptyArray()',
      );
    });

    it('should be pop in data with 1 element', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.pop();
      expect(await addressArrayMock.get()).to.eql([]);
    });

    it('should be pop in data with several elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      await addressArrayMock.pop();
      expect(await addressArrayMock.get()).to.eql([address1]);
    });

    it('should be several pops', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      await addressArrayMock.push(address3);
      await addressArrayMock.pop();
      expect(await addressArrayMock.get()).to.eql([
        address1,
        address2,
      ]);
    });

    it('should be thrown when pops more than elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.pop();
      await expect(addressArrayMock.pop()).to.eventually.be.rejectedWith(
        'PopFromEmptyArray()',
      );
    });
  });

  describe('set', async function () {
    it('should be thrown when set index less than data length', async function () {
      await expect(
        addressArrayMock.set(0, address1),
      ).to.eventually.be.rejectedWith('IndexOutOfBounds()');
    });

    it('should be set to index 0 to data with 1 element', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.set(0, address2);
      expect(await addressArrayMock.get()).to.eql([address2]);
    });

    it('should be set to index 0 to data with several elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      await addressArrayMock.set(0, address3);
      expect(await addressArrayMock.get()).to.eql([address3, address2]);
    });

    it('should be set to index non-0 to data with several elements', async function () {
      await addressArrayMock.push(address1);
      await addressArrayMock.push(address2);
      await addressArrayMock.set(1, address3);
      expect(await addressArrayMock.get()).to.eql([address1, address3]);
    });
  });
});

describe('Greeter', () => {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy('Hello, world!');
    await greeter.deployed();

    expect(await greeter.greet()).to.equal('Hello, world!');

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!');

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal('Hola, mundo!');
  });
});

// Load dependencies
import { expect } from 'chai';
import {
  BN,
  expectEvent,
  expectRevert,
  constants,
} from '@openzeppelin/test-helpers';
const HogeNFT = artifacts.require('HogeNFT');

require('dotenv').config();
require('web3');

// Import utilities from Test Helpers

// Start test block
contract('HogeNFT', function ([creator, other, holder]) {
  // Use large integers ('big numbers')
  const value = new BN('42');

  const name = 'HogeNFT';
  const symbol = 'NFT';

  beforeEach(async function () {
    this.token = await HogeNFT.new(name, symbol, { from: creator });
  });

  it('has metadata', async function () {
    expect(await this.token.name()).to.be.equal(name);
    expect(await this.token.symbol()).to.be.equal(symbol);
    expect(await this.token.baseURI()).to.be.equal(baseURI);
  });

  it('minter can mint', async function () {
    const tokenIdZero = new BN('0');
    const someURI = 'foo';

    const receipt = await this.token.mint(holder, someURI, { from: creator });

    expect(await this.token.ownerOf(tokenIdZero)).to.be.equal(holder);
    expect(await this.token.tokenURI(tokenIdZero)).to.be.equal(
      `${baseURI}${someURI}`,
    );
    expectEvent(receipt, 'Transfer', {
      from: constants.ZERO_ADDRESS,
      to: holder,
      tokenId: tokenIdZero,
    });
  });

  it('non minter cannot mint', async function () {
    // Test a transaction reverts
    await expectRevert(
      this.token.mint(holder, 'bar', { from: other }),
      'Must have minter role to mint -- Reason given: Must have minter role to mint.',
    );
  });

  it('mints batches', async function () {
    const uris = [web3.utils.fromAscii('foo'), web3.utils.fromAscii('bar')];
    const recipients = [creator, holder];

    const receipt = await this.token.mintBatch(recipients, uris, {
      from: creator,
    });

    expect(await this.token.ownerOf(new BN('0'))).to.be.equal(creator);
    expect(await this.token.ownerOf(new BN('1'))).to.be.equal(holder);
  });

  it('correctly assigns uris', async function () {
    const uri1 = web3.utils.asciiToHex('foo');
    const uri2 = web3.utils.asciiToHex('bar');

    const receipt = await this.token.mintBatch([holder], [uri1], {
      from: creator,
    }); // Token 0
    const receipt2 = await this.token.mintBatch([holder], [uri2], {
      from: creator,
    }); // Token 1

    expect(await this.token.tokenURI(new BN('0'))).to.be.equal(
      baseURI + web3.utils.hexToAscii(uri1),
    );
    expect(await this.token.tokenURI(new BN('1'))).to.be.equal(
      baseURI + web3.utils.hexToAscii(uri2),
    );
  });

  // This is a convenience method.
  // Use with test network to estimate cost of gas and transaction size.
  //
  // it("get the size of the contract", function() {
  //     return HogeNFT.deployed().then(function (instance) {
  //         var bytecode = instance.constructor._json.bytecode;
  //         var deployed = instance.constructor._json.deployedBytecode;
  //         var sizeOfB = bytecode.length / 2;
  //         var sizeOfD = deployed.length / 2;
  //         console.log("size of bytecode in bytes = ", sizeOfB);
  //         console.log("size of deployed in bytes = ", sizeOfD);
  //         console.log("initialisation and constructor code in bytes = ", sizeOfB - sizeOfD);
  //         console.log("Estimating Gas");
  //         instance.methods
  //             .mint(`${process.env.TESTNET_WALLET_ADDRESS}`, 1)
  //             .estimateGas()
  //             .then(function (estimate) {
  //                 console.log("Estimated gas to execute mint: ", estimate);
  //             });
  //
  //     });
  // })
});

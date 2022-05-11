import { expect } from 'chai';
import { ether, time } from './utils/prelude';
import { ethers } from 'hardhat';
import {
  timeIncreaseTo,
  fixSignature,
  trackReceivedTokenAndTx,
  countInstructions,
} from './utils/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

describe('timeIncreaseTo', async function () {
  const precision = 2;

  async function shouldIncrease(secs: number) {
    const timeBefore = await time.latest();
    await timeIncreaseTo(timeBefore.addn(secs));
    const timeAfter = await time.latest();

    expect(timeAfter).to.be.gt(timeBefore);
    expect(timeAfter.sub(timeBefore)).to.be.lte(
      BigNumber.from(secs).add(precision),
    );
    expect(timeAfter.sub(timeBefore)).to.be.gte(secs);
  }

  it('should be increased on 1000 sec', async function () {
    await shouldIncrease(1000);
  });

  it('should be increased on 2000 sec', async function () {
    await shouldIncrease(2000);
  });

  it('should be increased on 1000000 sec', async function () {
    await shouldIncrease(1000000);
  });

  it('should be thrown with increase time to a moment in the past', async function () {
    await expect(shouldIncrease(-1000)).to.eventually.be.rejectedWith(
      /Cannot increase current time \(\d+\) to a moment in the past \(\d+\)/,
    );
  });
});

describe('fixSignature', async function () {
  it('should not be fixed geth sign', async function () {
    const signature =
      '0xb453386b73ba5608314e9b4c7890a4bd12cc24c2c7bdf5f87778960ff85c56a8520dabdbea357fc561120dd2625bd8a904f35bdb4b153cf706b6ff25bb0d898d1c';
    expect(signature).equal(fixSignature(signature));
  });

  it('should be fixed ganache sign', async function () {
    const signature =
      '0x511fafdf71306ff89a063a76b52656c18e9a7d80d19e564c90f0126f732696bb673cde46003aad0ccb6dab2ca91ae38b82170824b0725883875194b273f709b901';
    const v = parseInt(signature.slice(130, 132), 16) + 27;
    const vHex = v.toString(16);
    expect(signature.slice(0, 130) + vHex).equal(fixSignature(signature));
  });
});

describe('', function () {
  let USDT: any;
  let USDC: any;
  let owner: SignerWithAddress;
  let wallet1: SignerWithAddress;
  before(async () => {
    const TokenMock = await ethers.getContractFactory('TokenMock');

    USDT = await TokenMock.deploy('USDT', 'USDT');
    USDC = await TokenMock.deploy('USDC', 'USDC');
    [owner, wallet1] = await ethers.getSigners();
    await USDT.deployed();
    await USDC.deployed();
  });

  beforeEach(async function () {
    for (const addr of [owner, wallet1]) {
      for (const token of [USDT, USDC]) {
        await token.mint(addr, ether('1000'));
      }
    }
  });

  describe.skip('signMessage', async function () {
    // it('should be signed test1', async function () {
    //   expect(await web3.eth.sign('0x', owner.address)).equal(
    //     await signMessage(owner.address),
    //   );
    // });
    // it('should be signed test2', async function () {
    //   const message = randomHex(32);
    //   expect(await web3.eth.sign(message, owner)).equal(
    //     await signMessage(owner.address, message),
    //   );
    // });
    // it('should be signed test3', async function () {
    //   const message = toHex('Test message');
    //   expect(await web3.eth.sign(message, owner.address)).equal(
    //     await signMessage(owner.address, message),
    //   );
    // });
  });

  describe('trackReceivedTokenAndTx', async function () {
    it('should be tracked ERC20 Transfer', async function () {
      const [received, tx] = await trackReceivedTokenAndTx(
        USDT,
        wallet1.address,
        () => USDT.transfer(wallet1, ether('1'), { from: owner }),
      );
      expect(received).to.be.equal(ether('1'));
      expect(tx.tx.length).equal(66);
      expect(tx.receipt.from).equal(owner.address.toLowerCase());
      expect(tx.receipt.to).equal(USDT.address.toLowerCase());
      expect(tx.logs.length).equal(1);
      expect(tx.logs[0].event).equal('Transfer');
    });

    it('should be tracked ERC20 Approve', async function () {
      const [received, tx] = await trackReceivedTokenAndTx(
        USDT,
        wallet1.address,
        () => USDT.approve(wallet1, ether('1'), { from: owner }),
      );
      expect(received).to.be.equal('0');
      expect(tx.tx.length).equal(66);
      expect(tx.receipt.from).equal(owner.address.toLowerCase());
      expect(tx.receipt.to).equal(USDT.address.toLowerCase());
      expect(tx.logs.length).equal(1);
      expect(tx.logs[0].event).equal('Approval');
    });
  });

  describe('trackReceivedToken', async function () {
    it('should be tracked ERC20 Transfer', async function () {
      const [received] = await trackReceivedTokenAndTx(
        USDT,
        wallet1.address,
        () => USDT.transfer(wallet1.address, ether('1'), { from: owner }),
      );
      expect(received).to.be.equal(ether('1'));
    });

    it('should be tracked ERC20 Approve', async function () {
      const [received] = await trackReceivedTokenAndTx(
        USDT,
        wallet1.address,
        () => USDT.approve(wallet1.address, ether('1'), { from: owner }),
      );
      expect(received).to.be.equal('0');
    });
  });

  describe('countInstructions', async function () {
    it('should be counted ERC20 Transfer', async function () {
      const [, tx] = await trackReceivedTokenAndTx(USDT, wallet1.address, () =>
        USDT.transfer(wallet1.address, ether('1'), { from: owner }),
      );
      expect(
        await countInstructions(tx.receipt.transactionHash, [
          'STATICCALL',
          'CALL',
          'SSTORE',
          'SLOAD',
        ]),
      ).to.be.deep.equal([0, 0, 2, 2]);
    });

    it('should be counted ERC20 Approve', async function () {
      const [, tx] = await trackReceivedTokenAndTx(USDT, wallet1.address, () =>
        USDT.approve(wallet1, ether('1'), { from: owner }),
      );
      expect(
        await countInstructions(tx.receipt.transactionHash, [
          'STATICCALL',
          'CALL',
          'SSTORE',
          'SLOAD',
        ]),
      ).to.be.deep.equal([0, 0, 1, 0]);
    });
  });
});

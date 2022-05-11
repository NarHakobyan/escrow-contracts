import { ethers } from 'hardhat';
import { RevertReasonParserTest } from '../../typechain';
import { expect } from 'chai';

describe('RevertReasonParser', async () => {
  let revertReasonParserTest: RevertReasonParserTest;

  beforeEach(async function () {
    const RevertReasonParserTest = await ethers.getContractFactory(
      'RevertReasonParserTest',
    );
    revertReasonParserTest = await RevertReasonParserTest.deploy();
  });

  describe('parse', async function () {
    it('should be reverted with Invalid revert reason', async function () {
      await expect(
        revertReasonParserTest.testParseWithThrow(),
      ).to.eventually.be.rejectedWith('InvalidRevertReason()');
    });

    it('should be parsed as empty Error', async function () {
      await revertReasonParserTest.testEmptyStringRevert();
    });

    it('should be parsed as Error', async function () {
      await revertReasonParserTest.testNonEmptyRevert();
    });

    it('should be parsed as Unknown', async function () {
      await revertReasonParserTest.testEmptyRevert();
    });

    it('should be parsed as Panic', async function () {
      await revertReasonParserTest.testAssertion();
    });

    it('should be parsed as Error with long string', async function () {
      await revertReasonParserTest.testLongStringRevert();
    });

    it('should be reverted in _test()', async function () {
      await expect(
        revertReasonParserTest.testWithThrow(),
      ).to.eventually.be.rejectedWith('TestDidNotThrow()');
    });
  });
});

import { ethers } from 'hardhat';
import { expect } from 'chai';
import { StringUtilTest } from '../../typechain';

describe('StringUtil', async () => {
  let stringUtilTest: StringUtilTest;
  beforeEach(async function () {
    const StringUtilTest = await ethers.getContractFactory('StringUtilTest');
    stringUtilTest = await StringUtilTest.deploy();
  });

  const uint256TestValue =
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
  const uint128TestValue =
    '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
  const veryLongArray =
    '0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50);
  const extremelyLongArray = '0x' + '0f'.repeat(1000);
  const emptyBytes = '0x';
  const singleByte = '0xaf';

  describe('Validity', async () => {
    it('Uint 256', () => test(uint256TestValue));

    it('Uint 128', () => test(uint128TestValue));

    it('Very long byte array', () => testBytes(veryLongArray));

    it('Extremely long byte array', () => testBytes(extremelyLongArray));

    it('Empty bytes. Skipped until resolved: https://github.com/ChainSafe/web3.js/issues/4512', () =>
      testBytes(emptyBytes));

    it('Single byte', () => testBytes(singleByte));

    async function test(value: string) {
      const result = await stringUtilTest.toHex(value, 0);
      const naiveResult = await stringUtilTest.toHexNaive(value, 0);
      expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
      expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
    }

    async function testBytes(value: string) {
      const result = await stringUtilTest.toHexBytes(value, 0);
      const naiveResult = await stringUtilTest.toHexNaiveBytes(value, 0);
      expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
      expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
    }
  });

  describe('Gas usage @skip-on-coverage', async () => {
    it('Uint 256', () => testGasUint256(uint256TestValue, 962));

    it('Uint 256 naive', () => testGasNaiveUint256(uint256TestValue, 15967));

    it('Uint 256 as bytes', () => testGasBytes(uint256TestValue, 834));

    it('Uint 256 as bytes naive', () =>
      testGasNaiveBytes(uint256TestValue, 15839));

    it('Uint 128', () => testGasUint256(uint128TestValue, 962));

    it('Uint 128 naive', () => testGasNaiveUint256(uint128TestValue, 15967));

    it('Very long byte array gas', () => testGasBytes(veryLongArray, 2082));

    it('Very long byte array gas naive', () =>
      testGasNaiveBytes(veryLongArray, 32686));

    it('Extremely long byte array gas', () =>
      testGasBytes(extremelyLongArray, 20196));

    it('Extremely long byte array gas naive', () =>
      testGasNaiveBytes(extremelyLongArray, 481824));

    it('Empty bytes', () => testGasBytes(emptyBytes, 210));

    it('Empty bytes naive', () => testGasNaiveBytes(emptyBytes, 435));

    it('Single byte', () => testGasBytes(singleByte, 834));

    it('Single byte naive', () => testGasNaiveBytes(singleByte, 916));

    async function testGasUint256(value: string, expectedGas: number) {
      await stringUtilTest.toHex(value, expectedGas);
    }

    async function testGasBytes(value: string, expectedGas: number) {
      await stringUtilTest.toHexBytes(value, expectedGas);
    }

    async function testGasNaiveUint256(value: string, expectedGas: number) {
      await stringUtilTest.toHexNaive(value, expectedGas);
    }

    async function testGasNaiveBytes(value: string, expectedGas: number) {
      await stringUtilTest.toHexNaiveBytes(value, expectedGas);
    }
  });
});

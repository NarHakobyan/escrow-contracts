import { expect } from 'chai';
import { fromRpcSig } from 'ethereumjs-util';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import {
  getPermit,
  buildData,
  signWithPk,
  getPermitLikeDai,
  buildDataLikeDai,
} from './utils/permit';
import { toBN } from 'web3-utils';
import { DaiLikePermitMock, PermitableMock } from '../typechain';

const value = toBN(42);
const nonce = '0';

describe.skip('Permitable', function () {
  let permitableMock: PermitableMock;
  let erc20PermitMock: any;
  let daiLikePermitMock: DaiLikePermitMock;
  let ownerAddress: string;
  let address1: string;
  let address2: string;
  const privateKey = '';
  const chainId = 1;
  beforeEach(async () => {
    const ERC20PermitMock = await ethers.getContractFactory('ERC20PermitMock');
    const PermitableMock = await ethers.getContractFactory('PermitableMock');
    const DaiLikePermitMock = await ethers.getContractFactory(
      'DaiLikePermitMock',
    );
    const [owner, wallet1, wallet2] = await ethers.getSigners();
    ownerAddress = owner.address;
    address1 = wallet1.address;
    address2 = wallet2.address;

    permitableMock = await PermitableMock.deploy();
    erc20PermitMock = await ERC20PermitMock.deploy(
      'USDC',
      'USDC',
      address1,
      BigNumber.from(100),
    );
    daiLikePermitMock = await DaiLikePermitMock.deploy(
      'DAI',
      'DAI',
      address1,
      BigNumber.from(100),
    );
    await erc20PermitMock.deployed();
    await daiLikePermitMock.deployed();
  });

  it('should be permitted for IERC20Permit', async function () {
    const permit = await getPermit(
      ownerAddress,
      privateKey,
      erc20PermitMock,
      '1',
      chainId,
      address2,
      value.toString(),
    );
    await permitableMock.__permit(erc20PermitMock.address, permit);
    expect(await erc20PermitMock.nonces(ownerAddress)).to.be.equal('1');
    expect(await erc20PermitMock.allowance(ownerAddress, address2)).to.be.equal(
      value,
    );
  });

  it('should not be permitted for IERC20Permit', async function () {
    const data = buildData(
      await erc20PermitMock.name(),
      '1',
      chainId,
      erc20PermitMock.address,
      ownerAddress,
      address2,
      value.toString(),
      nonce,
    );
    const signature = signWithPk(privateKey, data);
    const { v, r, s } = fromRpcSig(signature);

    // const permit = ethers.provider.encodeParameter(
    //   'tuple(address,address,uint256,uint256,uint8,bytes32,bytes32)',
    //   [ownerAddress, address1, value, defaultDeadline, v, r, s],
    // );
    const permit = '0x' + signature;
    await expect(
      permitableMock.__permit(erc20PermitMock.address, permit),
    ).to.eventually.be.rejectedWith('ERC20Permit: invalid signature');
  });

  it('should be permitted for IDaiLikePermit', async function () {
    const permit = await getPermitLikeDai(
      ownerAddress,
      privateKey,
      daiLikePermitMock,
      '1',
      chainId,
      address2,
      true,
    );
    await permitableMock.__permit(daiLikePermitMock.address, permit);

    const MAX_UINT128 = toBN('2').pow(toBN('128')).sub(toBN('1'));
    expect(await daiLikePermitMock.nonces(ownerAddress)).to.be.equal('1');
    expect(
      await daiLikePermitMock.allowance(ownerAddress, address2),
    ).to.be.equal(MAX_UINT128);
  });

  it('should not be permitted for IDaiLikePermit', async function () {
    const data = buildDataLikeDai(
      await daiLikePermitMock.name(),
      '1',
      chainId,
      daiLikePermitMock.address,
      ownerAddress,
      address2,
      nonce,
      true,
    );
    const signature = signWithPk(privateKey, data);
    const { v, r, s } = fromRpcSig(signature);

    // const payload = web3.eth.abi.encodeParameter(
    //   'tuple(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
    //   [ownerAddress, address1, nonce, defaultDeadline, true, v, r, s],
    // );

    const payload = '0x' + signature;

    await expect(
      permitableMock.__permit(daiLikePermitMock.address, payload),
    ).to.eventually.be.rejectedWith('Dai/invalid-permit');
  });

  it('should be wrong permit length', async function () {
    const data = buildData(
      await erc20PermitMock.name(),
      '1',
      chainId,
      erc20PermitMock.address,
      ownerAddress,
      address2,
      value.toString(),
      nonce,
    );
    const signature = signWithPk(privateKey, data);
    const { v, r, s } = fromRpcSig(signature);

    // const permit = web3.eth.abi.encodeParameter(
    //   'tuple(address,uint256,uint256,uint8,bytes32,bytes32)',
    //   [wallet2, value, defaultDeadline, v, r, s],
    // );

    const permit = '0x' + signature;

    await expect(
      permitableMock.__permit(erc20PermitMock.address, permit),
    ).to.eventually.be.rejectedWith('BadPermitLength()');
  });
});

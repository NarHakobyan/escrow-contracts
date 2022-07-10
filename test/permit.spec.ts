import { expect } from 'chai';
import { ethers } from 'hardhat';
import { DaiLikePermitMock } from '../typechain';
import {
  trim0x,
  buildData,
  EIP712Domain,
  Permit,
  defaultDeadline,
  buildDataLikeDai,
  DaiLikePermit,
  withTarget,
} from './utils/permit';

describe.skip('Methods', () => {
  let eRC20PermitMock: any;
  let daiLikePermitMock: DaiLikePermitMock;
  let ownerAddress: string;
  beforeEach(async () => {
    const ERC20PermitMock = await ethers.getContractFactory('ERC20PermitMock');
    const DaiLikePermitMock = await ethers.getContractFactory(
      'DaiLikePermitMock',
    );
    const [owner] = await ethers.getSigners();
    ownerAddress = owner.address;

    eRC20PermitMock = await ERC20PermitMock.deploy(
      'Token',
      'TKN',
      ownerAddress,
      '1',
    );
    daiLikePermitMock = await DaiLikePermitMock.deploy(
      'daiLikePermitMock',
      'DLT',
      ownerAddress,
      '1',
    );
    await eRC20PermitMock.deployed();
    await daiLikePermitMock.deployed();
  });

  it('should be trimmed', async () => {
    expect(trim0x('0x123456')).to.be.equal('123456');
  });

  it('should not be changed', async () => {
    expect(trim0x('123456')).to.be.equal('123456');
  });

  it('should correctly build data for permit', async () => {
    const data = buildData(
      await eRC20PermitMock.name(),
      '1',
      1,
      eRC20PermitMock.address,
      ownerAddress,
      ownerAddress,
      '1',
      '1',
    );
    expect(data).to.be.deep.equal({
      primaryType: 'Permit',
      types: {
        EIP712Domain,
        Permit,
      },
      domain: {
        name: await eRC20PermitMock.name(),
        version: '1',
        chainId: 31337,
        verifyingContract: eRC20PermitMock,
      },
      message: {
        owner: ownerAddress,
        spender: ownerAddress,
        value: '1',
        nonce: '1',
        deadline: defaultDeadline,
      },
    });
  });

  it('should correctly build data for dai-like permit', async () => {
    const data = buildDataLikeDai(
      await daiLikePermitMock.name(),
      '1',
      1,
      daiLikePermitMock.address,
      ownerAddress,
      ownerAddress,
      '1',
      true,
    );
    expect(data).to.be.deep.equal({
      primaryType: 'Permit',
      types: {
        EIP712Domain,
        Permit: DaiLikePermit,
      },
      domain: {
        name: await daiLikePermitMock.name(),
        version: '1',
        chainId: 31337,
        verifyingContract: daiLikePermitMock,
      },
      message: {
        holder: ownerAddress,
        spender: ownerAddress,
        nonce: '1',
        allowed: true,
        expiry: defaultDeadline,
      },
    });
  });

  it('should concat target with prefixed data', async () => {
    expect(withTarget('0x123456', '0x123456')).to.be.equal('0x123456123456');
  });

  it('should concat target with raw data', async () => {
    expect(withTarget('0x123456', '123456')).to.be.equal('0x123456123456');
  });
});

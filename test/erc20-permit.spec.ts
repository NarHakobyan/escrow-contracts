import { expect } from 'chai';
import { ethers, getNamedAccounts } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';

async function getPermitSignature(
  signer: SignerWithAddress,
  token: Contract,
  spender: string,
  value: number,
  deadline: BigNumber,
) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(signer.address),
    token.name(),
    '1',
    signer.getChainId(),
  ]);

  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address,
      },
      {
        Permit: [
          {
            name: 'owner',
            type: 'address',
          },
          {
            name: 'spender',
            type: 'address',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'nonce',
            type: 'uint256',
          },
          {
            name: 'deadline',
            type: 'uint256',
          },
        ],
      },
      {
        owner: signer.address,
        spender,
        value,
        nonce,
        deadline,
      },
    ),
  );
}

describe('ERC20Permit', function () {
  it('ERC20 permit', async function () {
    const [signer] = await ethers.getSigners();
    const { deployer } = await getNamedAccounts();

    console.log(signer.address);
    console.log(deployer);

    const Token = await ethers.getContractFactory('Token');
    const token = await Token.deploy();
    await token.deployed();

    const Vault = await ethers.getContractFactory('Vault');
    const vault = await Vault.deploy(token.address);
    await vault.deployed();

    const amount = 1000;
    await token.mint(signer.address, amount);

    const deadline = ethers.constants.MaxUint256;

    const { v, r, s } = await getPermitSignature(
      signer,
      token,
      vault.address,
      amount,
      deadline,
    );

    await vault.depositWithPermit(amount, deadline, v, r, s);
    expect(await token.balanceOf(vault.address)).to.equal(amount);
  });

  it('ERC20 approve', async function () {
    const [signer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('Token');
    const token = await Token.deploy();
    await token.deployed();

    const Vault = await ethers.getContractFactory('Vault');
    const vault = await Vault.deploy(token.address);
    await vault.deployed();

    const amount = 1000;
    await token.mint(signer.address, amount);

    await token.approve(vault.address, amount);

    await vault.deposit(amount);
    expect(await token.balanceOf(vault.address)).to.equal(amount);
  });
});

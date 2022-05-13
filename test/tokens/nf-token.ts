import { expect } from 'chai';
import { ethers } from 'hardhat';
import { NFTokenTestMock } from '../../typechain';
import { constants } from '../utils/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('NFTokenTestMock', () => {
  let nfToken: NFTokenTestMock;
  let address1: string;
  let address2: string;
  let address3: string;

  let owner: SignerWithAddress;
  let wallet1: SignerWithAddress;
  let wallet2: SignerWithAddress;
  let wallet3: SignerWithAddress;
  const id1 = 123;
  const id2 = 124;

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory('NFTokenTestMock');
    nfToken = await nftContract.deploy();
    [owner, wallet1, wallet2, wallet3] = await ethers.getSigners();
    address1 = wallet1.address;
    address2 = wallet2.address;
    address3 = wallet3.address;
    await nfToken.deployed();
  });

  it('correctly checks all the supported interfaces', async function () {
    expect(await nfToken.supportsInterface('0x80ac58cd')).to.equal(true);
    // expect(await nfToken.supportsInterface('0x5b5e139f')).to.equal(false);
  });

  it('correctly mints a NFT', async function () {
    expect(await nfToken.connect(owner).mint(address1, 1)).to.emit(
      nfToken,
      'Transfer',
    );
    expect(await nfToken.balanceOf(address1)).to.equal(1);
  });

  it('returns correct balanceOf', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(await nfToken.balanceOf(address1)).to.equal(1);
    await nfToken.connect(owner).mint(address1, id2);
    expect(await nfToken.balanceOf(address1)).to.equal(2);
  });

  it('throws when trying to get count of NFTs owned by 0x0 address', async function () {
    await expect(nfToken.balanceOf(constants.ZERO_ADDRESS)).to.be.revertedWith(
      'ERC721: balance query for the zero address',
    );
  });

  it('throws when trying to mint 2 NFTs with the same ids', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await expect(nfToken.connect(owner).mint(address1, id1)).to.be.revertedWith(
      'ERC721: token already minted',
    );
  });

  it('throws when trying to mint NFT to 0x0 address', async function () {
    await expect(
      nfToken.connect(owner).mint(constants.ZERO_ADDRESS, id1),
    ).to.be.revertedWith('ERC721: mint to the zero address');
  });

  it('finds the correct owner of NFToken id', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(await nfToken.ownerOf(id1)).to.equal(address1);
  });

  it('throws when trying to find owner od non-existing NFT id', async function () {
    await expect(nfToken.ownerOf(id1)).to.be.revertedWith('003002');
  });

  it('correctly approves account', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(await nfToken.connect(wallet1).approve(address3, id1)).to.emit(
      nfToken,
      'Approval',
    );
    expect(await nfToken.getApproved(id1)).to.equal(address3);
  });

  it('correctly cancels approval', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await nfToken.connect(wallet1).approve(address3, id1);
    await nfToken.connect(wallet1).approve(constants.ZERO_ADDRESS, id1);
    expect(await nfToken.getApproved(id1)).to.equal(constants.ZERO_ADDRESS);
  });

  it('throws when trying to get approval of non-existing NFT id', async function () {
    await expect(nfToken.getApproved(id1)).to.be.revertedWith('003002');
  });

  it('throws when trying to approve NFT ID from a third party', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await expect(
      nfToken.connect(wallet3).approve(address3, id1),
    ).to.be.revertedWith('003003');
  });

  it('correctly sets an operator', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(
      await nfToken.connect(wallet1).setApprovalForAll(address3, true),
    ).to.emit(nfToken, 'ApprovalForAll');
    expect(await nfToken.isApprovedForAll(address1, address3)).to.equal(true);
  });

  it('correctly sets then cancels an operator', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await nfToken.connect(wallet1).setApprovalForAll(address3, true);
    await nfToken.connect(wallet1).setApprovalForAll(address3, false);
    expect(await nfToken.isApprovedForAll(address1, address3)).to.equal(false);
  });

  it('correctly transfers NFT from owner', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(
      await nfToken.connect(wallet1).transferFrom(address1, address3, id1),
    ).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    expect(await nfToken.balanceOf(address3)).to.equal(1);
    expect(await nfToken.ownerOf(id1)).to.equal(address3);
  });

  it('correctly transfers NFT from approved address', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await nfToken.connect(wallet1).approve(address3, id1);
    await nfToken.connect(wallet3).transferFrom(address1, address2, id1);
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    expect(await nfToken.balanceOf(address2)).to.equal(1);
    expect(await nfToken.ownerOf(id1)).to.equal(address2);
  });

  it('correctly transfers NFT as operator', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await nfToken.connect(wallet1).setApprovalForAll(address3, true);
    await nfToken.connect(wallet3).transferFrom(address1, address2, id1);
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    expect(await nfToken.balanceOf(address2)).to.equal(1);
    expect(await nfToken.ownerOf(id1)).to.equal(address2);
  });

  it('throws when trying to transfer NFT as an address that is not owner, approved or operator', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await expect(
      nfToken.connect(wallet3).transferFrom(address1, address2, id1),
    ).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
  });

  it('throws when trying to transfer NFT to a zero address', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await expect(
      nfToken
        .connect(wallet1)
        .transferFrom(address1, constants.ZERO_ADDRESS, id1),
    ).to.be.revertedWith('ERC721: transfer to the zero address');
  });

  it('throws when trying to transfer an invalid NFT', async function () {
    await expect(
      nfToken.connect(wallet1).transferFrom(address1, address3, id1),
    ).to.be.revertedWith('003004');
  });

  it('throws when trying to transfer an invalid NFT', async function () {
    await expect(
      nfToken.connect(wallet1).transferFrom(address1, address3, id1),
    ).to.be.revertedWith('ERC721: operator query for nonexistent token');
  });

  it('correctly safe transfers NFT from owner', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(
      await nfToken
        .connect(wallet1)
        ['safeTransferFrom(address,address,uint256)'](address1, address3, id1),
    ).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    expect(await nfToken.balanceOf(address3)).to.equal(1);
    expect(await nfToken.ownerOf(id1)).to.equal(address3);
  });

  it('throws when trying to safe transfers NFT from owner to a smart contract', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    await expect(
      nfToken
        .connect(wallet1)
        ['safeTransferFrom(address,address,uint256)'](
          address1,
          nfToken.address,
          id1,
        ),
    ).to.be.revertedWith('ERC721: transfer to non ERC721Receiver implementer');
  });

  it('correctly safe transfers NFT from owner to smart contract that can receive NFTs', async function () {
    const tokenReceiverContract = await ethers.getContractFactory(
      'NFTokenReceiverTestMock',
    );
    const tokenReceiver = await tokenReceiverContract.deploy();
    await tokenReceiver.deployed();

    await nfToken.connect(owner).mint(address1, id1);
    await nfToken
      .connect(wallet1)
      ['safeTransferFrom(address,address,uint256)'](
        address1,
        tokenReceiver.address,
        id1,
      );
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    expect(await nfToken.balanceOf(tokenReceiver.address)).to.equal(1);
    expect(await nfToken.ownerOf(id1)).to.equal(tokenReceiver.address);
  });

  it('correctly safe transfers NFT from owner to smart contract that can receive NFTs with data', async function () {
    const tokenReceiverContract = await ethers.getContractFactory(
      'NFTokenReceiverTestMock',
    );
    const tokenReceiver = await tokenReceiverContract.deploy();
    await tokenReceiver.deployed();

    await nfToken.connect(owner).mint(address1, id1);
    expect(
      await nfToken
        .connect(wallet1)
        ['safeTransferFrom(address,address,uint256,bytes)'](
          address1,
          tokenReceiver.address,
          id1,
          '0x01',
        ),
    ).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    expect(await nfToken.balanceOf(tokenReceiver.address)).to.equal(1);
    expect(await nfToken.ownerOf(id1)).to.equal(tokenReceiver.address);
  });

  it('correctly burns a NFT', async function () {
    await nfToken.connect(owner).mint(address1, id1);
    expect(await nfToken.connect(owner).burn(id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    await expect(nfToken.ownerOf(id1)).to.be.revertedWith('003002');
  });

  it('throws when trying to burn non existent NFT', async function () {
    await expect(nfToken.connect(owner).burn(id1)).to.be.revertedWith('003002');
  });

  // it.only('safeTransfer does not call onERC721Received to constructing contract', async function() {
  //   const sendsToSelfOnConstructContract = await ethers.getContractFactory('SendsToSelfOnConstruct');
  //   const sendsToSelfOnConstruct = await sendsToSelfOnConstructContract.deploy();
  //   expect(await sendsToSelfOnConstruct.deployed().deployTransaction).to.emit(sendsToSelfOnConstructContract, 'Transfer');
  //   console.log('here');
  //   // console.log(log);
  //   // console.log(sendsToSelfOnConstruct); No Receive event, 2x Transfer
  // });
});

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { NFTokenEnumerableTestMock } from '../../typechain';

describe('nf-token-enumerable', function () {
  let nfToken: NFTokenEnumerableTestMock;
  let ownerAddress: string;
  let address1: string;
  let address2: string;
  const id1 = 123;
  const id2 = 124;
  const id3 = 125;

  beforeEach(async () => {
    const NFTokenEnumerableTestMock = await ethers.getContractFactory(
      'NFTokenEnumerableTestMock',
    );
    nfToken = await NFTokenEnumerableTestMock.deploy();
    const [owner, wallet1, wallet2] = await ethers.getSigners();
    ownerAddress = owner.address;
    address1 = wallet1.address;
    address2 = wallet2.address;
    await nfToken.deployed();
  });

  it('correctly checks all the supported interfaces', async function () {
    expect(await nfToken.supportsInterface('0x80ac58cd')).to.equal(true);
    expect(await nfToken.supportsInterface('0x780e9d63')).to.equal(true);
    expect(await nfToken.supportsInterface('0x5b5e139f')).to.equal(false);
  });

  it('correctly mints a NFT', async function () {
    expect(await nfToken.connect(ownerAddress).mint(address1, id1)).to.emit(
      nfToken,
      'Transfer',
    );
    expect(await nfToken.balanceOf(address1)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it('returns the correct token by index', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await nfToken.connect(ownerAddress).mint(address1, id2);
    await nfToken.connect(ownerAddress).mint(address1, id3);
    expect(await nfToken.tokenByIndex(0)).to.equal(id1);
    expect(await nfToken.tokenByIndex(1)).to.equal(id2);
    expect(await nfToken.tokenByIndex(2)).to.equal(id3);
  });

  it('throws when trying to get token by non-existing index', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await expect(nfToken.tokenByIndex(1)).to.be.revertedWith('005007');
  });

  it('returns the correct token of owner by index', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await nfToken.connect(ownerAddress).mint(address1, id2);
    await nfToken.connect(ownerAddress).mint(address2, id3);
    expect(await nfToken.tokenOfOwnerByIndex(address1, 1)).to.equal(id2);
  });

  it('throws when trying to get token of owner by non-existing index', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await expect(nfToken.tokenOfOwnerByIndex(address1, 1)).to.be.revertedWith(
      '005007',
    );
  });

  it('mint should correctly set ownerToIds and idToOwnerIndex and idToIndex', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await nfToken.connect(ownerAddress).mint(address1, id3);
    await nfToken.connect(ownerAddress).mint(address1, id2);

    expect(await nfToken.idToOwnerIndexWrapper(id1)).to.equal(0);
    expect(await nfToken.idToOwnerIndexWrapper(id3)).to.equal(1);
    expect(await nfToken.idToOwnerIndexWrapper(id2)).to.equal(2);
    expect(await nfToken.ownerToIdsLen(address1)).to.equal(3);
    expect(await nfToken.ownerToIdbyIndex(address1, 0)).to.equal(id1);
    expect(await nfToken.ownerToIdbyIndex(address1, 1)).to.equal(id3);
    expect(await nfToken.ownerToIdbyIndex(address1, 2)).to.equal(id2);
    expect(await nfToken.idToIndexWrapper(id1)).to.equal(0);
    expect(await nfToken.idToIndexWrapper(id3)).to.equal(1);
    expect(await nfToken.idToIndexWrapper(id2)).to.equal(2);
  });

  it('burn should correctly set ownerToIds and idToOwnerIndex and idToIndex', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await nfToken.connect(ownerAddress).mint(address1, id3);
    await nfToken.connect(ownerAddress).mint(address1, id2);

    // burn id1
    await nfToken.connect(ownerAddress).burn(id1);
    expect(await nfToken.idToOwnerIndexWrapper(id3)).to.equal(1);
    expect(await nfToken.idToOwnerIndexWrapper(id2)).to.equal(0);
    expect(await nfToken.ownerToIdsLen(address1)).to.equal(2);
    expect(await nfToken.ownerToIdbyIndex(address1, 0)).to.equal(id2);
    expect(await nfToken.ownerToIdbyIndex(address1, 1)).to.equal(id3);
    expect(await nfToken.idToIndexWrapper(id2)).to.equal(0);
    expect(await nfToken.idToIndexWrapper(id3)).to.equal(1);
    expect(await nfToken.tokenByIndex(0)).to.equal(id2);
    expect(await nfToken.tokenByIndex(1)).to.equal(id3);

    // burn id2
    await nfToken.connect(ownerAddress).burn(id2);
    expect(await nfToken.idToOwnerIndexWrapper(id3)).to.equal(0);
    expect(await nfToken.ownerToIdsLen(address1)).to.equal(1);
    expect(await nfToken.ownerToIdbyIndex(address1, 0)).to.equal(id3);
    expect(await nfToken.idToIndexWrapper(id3)).to.equal(0);
    expect(await nfToken.tokenByIndex(0)).to.equal(id3);

    // burn id3
    await nfToken.connect(ownerAddress).burn(id3);
    expect(await nfToken.idToOwnerIndexWrapper(id3)).to.equal(0);
    expect(await nfToken.ownerToIdsLen(address1)).to.equal(0);
    await expect(nfToken.ownerToIdbyIndex(address1, 0)).to.be.revertedWith(
      'VM Exception while processing transaction: reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)',
    );
    expect(await nfToken.idToIndexWrapper(id3)).to.equal(0);
  });

  it('transfer should correctly set ownerToIds and idToOwnerIndex and idToIndex', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1);
    await nfToken.connect(ownerAddress).mint(address1, id3);
    await nfToken.connect(ownerAddress).mint(address1, id2);
    await nfToken.connect(address1).transferFrom(address1, address2, id1);

    expect(await nfToken.idToOwnerIndexWrapper(id1)).to.equal(0);
    expect(await nfToken.idToOwnerIndexWrapper(id3)).to.equal(1);
    expect(await nfToken.idToOwnerIndexWrapper(id2)).to.equal(0);

    expect(await nfToken.ownerToIdsLen(address1)).to.equal(2);
    expect(await nfToken.ownerToIdbyIndex(address1, 0)).to.equal(id2);
    expect(await nfToken.ownerToIdbyIndex(address1, 1)).to.equal(id3);
    await expect(nfToken.ownerToIdbyIndex(address1, 2)).to.be.revertedWith(
      'VM Exception while processing transaction: reverted with panic code 0x32 (Array accessed at an out-of-bounds or negative index)',
    );

    expect(await nfToken.ownerToIdsLen(address2)).to.equal(1);
    expect(await nfToken.ownerToIdbyIndex(address2, 0)).to.equal(id1);
  });
});

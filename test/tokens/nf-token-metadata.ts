import { expect } from 'chai';
import { ethers } from 'hardhat';
import { NFTokenMetadataTestMock } from '../../typechain';

describe('nf-token-metadata', () => {
  let nfToken: NFTokenMetadataTestMock;
  let ownerAddress: string;
  let address1: string;
  const id1 = 1;
  const uri1 = 'https://nibbstack.com/1';

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory(
      'NFTokenMetadataTestMock',
    );
    nfToken = await nftContract.deploy('Foo', 'F');
    const [owner, wallet1] = await ethers.getSigners();

    ownerAddress = owner.address;
    address1 = wallet1.address;
    await nfToken.deployed();
  });

  it('correctly checks all the supported interfaces', async function () {
    expect(await nfToken.supportsInterface('0x80ac58cd')).to.equal(true);
    expect(await nfToken.supportsInterface('0x5b5e139f')).to.equal(true);
    expect(await nfToken.supportsInterface('0x780e9d63')).to.equal(false);
  });

  it('returns the correct contract name', async function () {
    expect(await nfToken.name()).to.equal('Foo');
  });

  it('returns the correct contract symbol', async function () {
    expect(await nfToken.symbol()).to.equal('F');
  });

  it('correctly mints a NFT', async function () {
    expect(
      await nfToken.connect(ownerAddress).mint(address1, id1, uri1),
    ).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(address1)).to.equal(1);
    expect(await nfToken.tokenURI(id1)).to.equal(uri1);
  });

  it('throws when trying to get URI of invalid NFT ID', async function () {
    await expect(nfToken.tokenURI(id1)).to.be.revertedWith('003002');
  });

  it('correctly burns a NFT', async function () {
    await nfToken.connect(ownerAddress).mint(address1, id1, uri1);
    expect(await nfToken.connect(ownerAddress).burn(id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(address1)).to.equal(0);
    await expect(nfToken.ownerOf(id1)).to.be.revertedWith('003002');
    expect(await nfToken.checkUri(id1)).to.equal('');
  });
});

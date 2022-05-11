// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This is an example contract implementation of NFToken.
 */
contract NFTokenMock is ERC721, Ownable {
    constructor() ERC721("NFTokenMock", "NFTM") {}

    /**
     * @dev Mints a new NFT.
     * @param _to The address that will own the minted NFT.
     * @param _tokenId of the NFT to be minted by the msg.sender.
     */
    function mint(address _to, uint256 _tokenId) external onlyOwner {
        super._mint(_to, _tokenId);
    }
}

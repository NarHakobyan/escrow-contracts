// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This is an example contract implementation of NFToken with enumerable extension.
 */
abstract contract NFTokenEnumerableMock is ERC721Enumerable, Ownable {
    /**
     * @dev Mints a new NFT.
     * @param _to The address that will own the minted NFT.
     * @param _tokenId of the NFT to be minted by the msg.sender.
     */
    function mint(address _to, uint256 _tokenId) external onlyOwner {
        super._mint(_to, _tokenId);
    }

    /**
     * @dev Removes a NFT from owner.
     * @param _tokenId Which NFT we want to remove.
     */
    function burn(uint256 _tokenId) external onlyOwner {
        super._burn(_tokenId);
    }
}

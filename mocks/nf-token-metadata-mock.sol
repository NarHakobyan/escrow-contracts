// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This is an example contract implementation of NFToken with metadata extension.
 */
contract NFTokenMetadataMock is ERC721, Ownable {
    /**
     * @dev Contract constructor.
     * @param _name A descriptive name for a collection of NFTs.
     * @param _symbol An abbreviated name for NFTokens.
     */
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    /**
     * @dev Mints a new NFT.
     * @param _to The address that will own the minted NFT.
     * @param _tokenId of the NFT to be minted by the msg.sender.
     * @param _uri String representing RFC 3986 URI.
     */
    function mint(
        address _to,
        uint256 _tokenId,
        string calldata _uri
    ) external onlyOwner {
        super._mint(_to, _tokenId);
        // super._setTokenUri(_tokenId, _uri);
        super.tokenURI(_tokenId);
    }

    /**
     * @dev Removes a NFT from owner.
     * @param _tokenId Which NFT we want to remove.
     */
    function burn(uint256 _tokenId) external onlyOwner {
        super._burn(_tokenId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTokenEnumerableTestMock is ERC721Enumerable {
    constructor() ERC721("123", "123") {}

    function ownerToIdsLen(address _owner) external view returns (uint256) {
        // return _ownedTokens[_owner].length;
        return 0;
    }

    function ownerToIdbyIndex(address _owner, uint256 _index)
        external
        view
        returns (uint256)
    {
        return super.tokenOfOwnerByIndex(_owner, _index);
    }

    function idToOwnerIndexWrapper(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        // return idToOwnerIndex[_tokenId];
        return 0;
    }

    function idToIndexWrapper(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        // return idToIndex[_tokenId];
        return 0;
    }
}

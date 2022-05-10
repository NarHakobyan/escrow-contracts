// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract NFTokenEnumerableTestMock is IERC721Enumerable {
    function ownerToIdsLen(address _owner) external view returns (uint256) {
        return ownerToIds[_owner].length;
    }

    function ownerToIdbyIndex(address _owner, uint256 _index)
        external
        view
        returns (uint256)
    {
        return ownerToIds[_owner][_index];
    }

    function idToOwnerIndexWrapper(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        return idToOwnerIndex[_tokenId];
    }

    function idToIndexWrapper(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        return idToIndex[_tokenId];
    }
}

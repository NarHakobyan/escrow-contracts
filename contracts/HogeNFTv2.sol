// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IHogeNFTv2 {}

contract HogeNFTv2 is IHogeNFTv2, Context, AccessControl, ERC721, Ownable {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    Counters.Counter private _tokenIdTracker;

    event Received(address indexed, uint256);
    event Mint(address indexed from, address indexed to, string uri);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _setupRole(AccessControl.DEFAULT_ADMIN_ROLE, _msgSender());

        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            interfaceId == type(IHogeNFTv2).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function mint(address to, string memory uri) public {
        emit Mint(_msgSender(), to, uri);
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "Must have minter role to mint"
        );

        _safeMint(to, _tokenIdTracker.current());
        // _setTokenURI(_tokenIdTracker.current(), uri);
        tokenURI(_tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    function burn(uint256 tokenId) public virtual {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Burn: Caller is not owner nor approved"
        );
        _burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://www.hogemint.com/uri/contract-HogeNFTv2";
    }

    function contractURI() public pure returns (string memory) {
        return "https://www.hogemint.com/uri/contract-HogeNFTv2";
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

contract URLShortner {
    struct URLStruct {
        address owner;
        string url;
        bool exists;
        bool paid;
    }
    mapping(bytes => URLStruct) private lookupTable;
    mapping(address => bytes[]) public shortenedURLs;
    address[] private accts;
    address payable private owner;
    event URLShortened(string url, bytes slug, address owner);

    constructor() {
        owner = payable(msg.sender);
    }

    function shortenURLWithSlug(
        string memory _url,
        bytes memory _short,
        bool paid
    ) public payable {
        bool paidDefault = false;
        if (!lookupTable[_short].exists) {
            lookupTable[_short] = URLStruct(
                msg.sender,
                _url,
                true,
                paid || paidDefault
            );
            shortenedURLs[msg.sender].push(_short);
            if (shortenedURLs[msg.sender].length < 1) {
                accts.push(msg.sender);
            }
            emit URLShortened(_url, _short, msg.sender);
        }
    }

    function shortenURL(string memory url, bool paid) public payable {
        bool paidDefault = false;
        bytes memory shortHash = getShortSlug(url);
        return shortenURLWithSlug(url, shortHash, paid || paidDefault);
    }

    function listAccts() public view returns (address[] memory) {
        return accts;
    }

    function getURL(bytes memory _short) public view returns (string memory) {
        URLStruct storage result = lookupTable[_short];
        if (result.exists) {
            return result.url;
        }
        return "FAIL";
    }

    function kill() public {
        if (msg.sender == owner) selfdestruct(owner);
    }

    // privates
    function getShortSlug(string memory str)
        internal
        pure
        returns (bytes memory)
    {
        bytes32 hash = sha256(abi.encodePacked(str));
        uint256 mainShift = 15;
        bytes32 mask = 0xffffff0000000000000000000000000000000000000000000000000000000000;
        return abi.encodePacked(bytes3((hash << (mainShift * 6)) & mask));
    }
}

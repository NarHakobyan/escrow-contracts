// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Base64.sol";

contract PetNumber is ERC721Enumerable, Ownable, VRFConsumerBase {
    using Strings for uint256;

    uint256[65536] public numbers;
    bytes32 private s_keyHash;
    uint256 private s_fee;

    uint256 private randomNumberLink;
    bytes32 public requestIdLink;

    // _VRFCoordinator (address): 0x3d2341adb2d31f1c5530cdc622016af293177ae0
    // _LinkToken (address): 0xb0897686c545045afc77cf20ec7a532e3120e0f1
    // _keyHash (bytes32): 0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da
    // _fee (uint256): 1000000000000000

    constructor(
        address _VRFCoordinator,
        address _LinkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_VRFCoordinator, _LinkToken) ERC721("Pet Number", "PET") {
        s_keyHash = _keyHash;
        s_fee = _fee;
    }

    /**
     * Requests randomness
     */
    function getRandomNumber() public onlyOwner returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= s_fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(s_keyHash, s_fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomNumberLink = randomness;
        requestIdLink = requestId;
    }

    function withdrawLink() external onlyOwner {
        require(
            LINK.transfer(msg.sender, LINK.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function mint() public payable {
        uint256 supply = totalSupply();
        require(supply + 1 <= 65536, "Supply limit reached");

        numbers[supply] = random256(randomNumberLink, supply + 1);

        _safeMint(msg.sender, supply + 1);
    }

    function withdraw() external onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    function random256(uint256 _seed, uint256 _salt)
        public
        view
        returns (uint256)
    {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, _seed, _salt)
                )
            );
    }

    function buildImage(uint256 _tokenId) public view returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: Image query for nonexistent token"
        );

        return
            Base64.encode(
                bytes(
                    abi.encodePacked(
                        '<svg xmlns="http://www.w3.org/2000/svg">',
                        '<text  x="10" y="20" fill="green">',
                        numbers[_tokenId - 1].toHexString(),
                        "</text></svg>"
                    )
                )
            );
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                "Pet Number ",
                                _tokenId.toString(),
                                '","description":"',
                                "Since almost all NFT are encoded in a number, we went ahead and created a Pet Number which is the number itself. ",
                                'A blank canvas for your imagination. All data is stored onchain. It has 32 bytes and each one represent a feature with up to 256 possibles traits."',
                                ',"image":"',
                                "data:image/svg+xml;base64,",
                                buildImage(_tokenId),
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}

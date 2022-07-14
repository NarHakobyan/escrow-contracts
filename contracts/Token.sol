// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "hardhat/console.sol";

contract Token is ERC20Permit {
    constructor() ERC20Permit("Token") ERC20("Token", "TOKEN") {
    }

    function mint(address _to, uint _amount) external {
        _mint(_to, _amount);
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        return super.approve(spender, amount);
    }
}

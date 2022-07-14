// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

interface IPermitToken is IERC20Permit, IERC20 {

}

contract Vault {
    IPermitToken public immutable token;

    constructor(address _token) {
        token = IPermitToken(_token);
    }

    function deposit(uint amount) external {
        token.transferFrom(msg.sender, address(this), amount);
    }

    function depositWithPermit(uint amount, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        token.permit(msg.sender, address(this), amount, deadline, v, r, s);
        token.transferFrom(msg.sender, address(this), amount);
    }
    function depositWithApprove(uint amount) external {
        token.approve(address(this), amount);
        uint approve = token.allowance(msg.sender, address(this));
        console.log(approve);
        token.transferFrom(msg.sender, address(this), amount);
    }
}

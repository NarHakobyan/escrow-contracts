// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.9;

import {IWETH} from "./interfaces/IWETH.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BasicToken is IWETH, Ownable {
    using SafeMath for uint256;

    string public constant NAME = "BasicToken";
    string public constant SYMBOL = "BTC";
    uint8 public constant DECIMALS = 18;

    mapping(address => uint256) private balances;

    mapping(address => mapping(address => uint256)) private allowed;

    uint256 private totalSupply_ = 100 ether;

    event Bought(address indexed buyer, uint256 value);
    event Sold(address indexed seller, uint256 value);

    constructor() {
        balances[owner()] = totalSupply_;
    }

    function name() public pure returns (string memory) {
        return NAME;
    }

    function symbol() public pure returns (string memory) {
        return SYMBOL;
    }

    function decimals() public pure returns (uint8) {
        return DECIMALS;
    }

    function totalSupply() public view override returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner)
        public
        view
        override
        returns (uint256)
    {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens)
        public
        override
        returns (bool)
    {
        require(
            numTokens <= balances[msg.sender],
            "Not enough tokens in account."
        );
        balances[msg.sender] = balances[msg.sender].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens)
        public
        override
        returns (bool)
    {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address from, address delegate)
        public
        view
        override
        returns (uint256)
    {
        return allowed[from][delegate];
    }

    function transferFrom(
        address from,
        address buyer,
        uint256 numTokens
    ) public override returns (bool) {
        require(numTokens <= balances[from], "Not enough tokens in account.");
        require(
            numTokens <= allowed[from][msg.sender],
            "Not enough tokens approved."
        );

        balances[from] = balances[from].sub(numTokens);
        allowed[from][msg.sender] = allowed[from][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(from, buyer, numTokens);
        return true;
    }

    function deposit() public payable {
        uint256 amountTobuy = msg.value;
        require(amountTobuy > 0, "You need to send some Ether");

        uint256 balance = balanceOf(owner());
        require(amountTobuy <= balance, "Not enough tokens in the reserve");
        transfer(msg.sender, amountTobuy);
        emit Bought(msg.sender, amountTobuy);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "You need to sell at least some tokens");
        require(
            allowance(msg.sender, owner()) >= amount,
            "Check the token allowance"
        );
        transferFrom(msg.sender, owner(), amount);
        (bool success, ) = (msg.sender).call{value: amount}("");

        if (!success) {
            revert("You need to send the funds to the contract");
        }
        emit Sold(msg.sender, amount);
    }
}

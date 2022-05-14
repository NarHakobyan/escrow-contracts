// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AddressArray} from "../libraries/AddressArray.sol";

contract AddressArrayMock {
    using AddressArray for AddressArray.Data;

    AddressArray.Data private _self;

    function length() external view returns (uint256) {
        return _self.length();
    }

    function at(uint256 i) external view returns (address) {
        return _self.at(i);
    }

    function get() external view returns (address[] memory arr) {
        return _self.get();
    }

    function push(address account) external returns (uint256) {
        return _self.push(account);
    }

    function pop() external {
        _self.pop();
    }

    function set(uint256 index, address account) external {
        _self.set(index, account);
    }
}

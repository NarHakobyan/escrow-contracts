// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AddressSet} from "../libraries/AddressSet.sol";

contract AddressSetMock {
    using AddressSet for AddressSet.Data;

    AddressSet.Data private _self;

    function length() external view returns (uint256) {
        return _self.length();
    }

    function at(uint256 index) external view returns (address) {
        return _self.at(index);
    }

    function contains(address item) external view returns (bool) {
        return _self.contains(item);
    }

    function add(address item) external returns (bool) {
        return _self.add(item);
    }

    function remove(address item) external returns (bool) {
        return _self.remove(item);
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AddressArray.sol";

library AddressSet {
    using AddressArray for AddressArray.Data;

    struct Data {
        AddressArray.Data items;
        mapping(address => uint256) lookup;
    }

    function length(Data storage s) internal view returns (uint256) {
        return s.items.length();
    }

    function at(Data storage s, uint256 index) internal view returns (address) {
        return s.items.at(index);
    }

    function contains(Data storage s, address item)
        internal
        view
        returns (bool)
    {
        return s.lookup[item] != 0;
    }

    function add(Data storage s, address item) internal returns (bool) {
        if (s.lookup[item] > 0) {
            return false;
        }
        s.lookup[item] = s.items.push(item);
        return true;
    }

    function remove(Data storage s, address item) internal returns (bool) {
        uint256 index = s.lookup[item];
        if (index == 0) {
            return false;
        }
        if (index < s.items.length()) {
            unchecked {
                address lastItem = s.items.at(s.items.length() - 1);
                s.items.set(index - 1, lastItem);
                s.lookup[lastItem] = index;
            }
        }
        s.items.pop();
        delete s.lookup[item];
        return true;
    }
}

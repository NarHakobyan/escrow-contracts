// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract AddressUtilsMock {
    using Address for address;

    function isContract(address _addr)
        external
        view
        returns (bool addressCheck)
    {
        addressCheck = _addr.isContract();
    }
}

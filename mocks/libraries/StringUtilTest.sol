// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "../../contracts/libraries/StringUtil.sol";
import "./StringUtilNaive.sol";
import "../../contracts/GasChecker.sol";

contract StringUtilTest is GasChecker {
    function toHex(uint256 value, uint256 expectedGasCost)
        external
        view
        checkGasCost(expectedGasCost)
        returns (string memory)
    {
        return StringUtil.toHex(value);
    }

    function toHexBytes(bytes memory data, uint256 expectedGasCost)
        external
        view
        checkGasCost(expectedGasCost)
        returns (string memory)
    {
        return StringUtil.toHex(data);
    }

    function toHexNaive(uint256 value, uint256 expectedGasCost)
        external
        view
        checkGasCost(expectedGasCost)
        returns (string memory)
    {
        return StringUtilNaive.toHex(value);
    }

    function toHexNaiveBytes(bytes memory data, uint256 expectedGasCost)
        external
        view
        checkGasCost(expectedGasCost)
        returns (string memory)
    {
        return StringUtilNaive.toHex(data);
    }
}

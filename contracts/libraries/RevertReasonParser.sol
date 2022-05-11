// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;
pragma abicoder v1;

import "./StringUtil.sol";

/** @title Library that allows to parse unsuccessful arbitrary calls revert reasons.
 * See https://solidity.readthedocs.io/en/latest/control-structures.html#revert for details.
 * Note that we assume revert reason being abi-encoded as Error(string) so it may fail to parse reason
 * if structured reverts appear in the future.
 *
 * All unsuccessful parsings get encoded as Unknown(data) string
 */
library RevertReasonParser {
    using StringUtil for uint256;
    using StringUtil for bytes;

    error InvalidRevertReason();

    bytes4 private constant _ERROR_SELECTOR =
        bytes4(keccak256("Error(string)"));
    bytes4 private constant _PANIC_SELECTOR =
        bytes4(keccak256("Panic(uint256)"));

    function parse(bytes memory data) internal pure returns (bytes memory) {
        // https://solidity.readthedocs.io/en/latest/control-structures.html#revert
        // We assume that revert reason is abi-encoded as Error(string)
        bytes4 selector;
        assembly {
            // solhint-disable-line no-inline-assembly
            selector := mload(add(data, 0x20))
        }

        // 68 = 4-byte selector + 32 bytes offset + 32 bytes length
        if (selector == _ERROR_SELECTOR && data.length >= 68) {
            string memory reason;
            // solhint-disable no-inline-assembly
            assembly {
                // 68 = 32 bytes data length + 4-byte selector + 32 bytes offset
                reason := add(data, 68)
            }
            /*
                revert reason is padded up to 32 bytes with ABI encoder: Error(string)
                also sometimes there is extra 32 bytes of zeros padded in the end:
                https://github.com/ethereum/solidity/issues/10170
                because of that we can't check for equality and instead check
                that string length + extra 68 bytes is less than overall data length
            */
            if (data.length < 68 + bytes(reason).length)
                revert InvalidRevertReason();
            return bytes.concat("Error(", bytes(reason), ")");
        }
        // 36 = 4-byte selector + 32 bytes integer
        else if (selector == _PANIC_SELECTOR && data.length == 36) {
            uint256 code;
            // solhint-disable no-inline-assembly
            assembly {
                // 36 = 32 bytes data length + 4-byte selector
                code := mload(add(data, 36))
            }
            return bytes.concat("Panic(", bytes(code.toHex()), ")");
        }
        return bytes.concat("Unknown(", bytes(data.toHex()), ")");
    }
}

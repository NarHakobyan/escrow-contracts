// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
pragma abicoder v1;

library RevertReasonForwarder {
    function reRevert() internal pure {
        // bubble up revert reason from latest external call
        // solhint-disable no-inline-assembly
        assembly {
            returndatacopy(0, 0, returndatasize())
            revert(0, returndatasize())
        }
    }
}

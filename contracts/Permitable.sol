// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "./interfaces/IDaiLikePermit.sol";
import "./libraries/RevertReasonForwarder.sol";

contract Permitable {
    error BadPermitLength();

    function _permit(address token, bytes calldata permit) internal virtual {
        if (permit.length > 0) {
            bool success;
            if (permit.length == 32 * 7) {
                (success, ) = token.call(
                    abi.encodePacked(IERC20Permit.permit.selector, permit)
                );
            } else if (permit.length == 32 * 8) {
                (success, ) = token.call(
                    abi.encodePacked(IDaiLikePermit.permit.selector, permit)
                );
            } else {
                revert BadPermitLength();
            }
            if (!success) {
                RevertReasonForwarder.reRevert();
            }
        }
    }
}

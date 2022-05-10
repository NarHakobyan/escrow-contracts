// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./RevertReasonForwarder.sol";
import "./StringUtil.sol";

library UniERC20 {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    error ApproveCalledOnETH();
    error NotEnoughValue();
    error FromIsNotSender();
    error ToIsNotThis();
    error ERC20OperationFailed();

    IERC20 private constant _ETH_ADDRESS =
        IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    IERC20 private constant _ZERO_ADDRESS = IERC20(address(0));

    function isETH(IERC20 token) internal pure returns (bool) {
        return (token == _ZERO_ADDRESS || token == _ETH_ADDRESS);
    }

    function uniBalanceOf(IERC20 token, address account)
        internal
        view
        returns (uint256)
    {
        if (isETH(token)) {
            return account.balance;
        } else {
            return token.balanceOf(account);
        }
    }

    function uniTransfer(
        IERC20 token,
        address payable to,
        uint256 amount
    ) internal {
        if (amount > 0) {
            if (isETH(token)) {
                to.transfer(amount);
            } else {
                token.safeTransfer(to, amount);
            }
        }
    }

    function uniTransferFrom(
        IERC20 token,
        address payable from,
        address to,
        uint256 amount
    ) internal {
        if (amount > 0) {
            if (isETH(token)) {
                if (msg.value < amount) revert NotEnoughValue();
                if (from != msg.sender) revert FromIsNotSender();
                if (to != address(this)) revert ToIsNotThis();
                if (msg.value > amount) {
                    // Return remainder if exist
                    from.transfer(msg.value.sub(amount));
                }
            } else {
                token.safeTransferFrom(from, to, amount);
            }
        }
    }

    function uniSymbol(IERC20 token) internal view returns (string memory) {
        return _uniDecode(token, "symbol()", "SYBMOL()");
    }

    function uniName(IERC20 token) internal view returns (string memory) {
        return _uniDecode(token, "name()", "NAME()");
    }

    function uniApprove(
        IERC20 token,
        address to,
        uint256 amount
    ) internal {
        if (isETH(token)) revert ApproveCalledOnETH();

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = address(token).call(
            abi.encodeWithSelector(token.approve.selector, to, amount)
        );

        if (
            !success ||
            (returndata.length > 0 && !abi.decode(returndata, (bool)))
        ) {
            _callOptionalReturn(
                token,
                abi.encodeWithSelector(token.approve.selector, to, 0)
            );
            _callOptionalReturn(
                token,
                abi.encodeWithSelector(token.approve.selector, to, amount)
            );
        }
    }

    function _uniDecode(
        IERC20 token,
        string memory lowerCaseSignature,
        string memory upperCaseSignature
    ) private view returns (string memory) {
        if (isETH(token)) {
            return "ETH";
        }

        (bool success, bytes memory data) = address(token).staticcall{
            gas: 20000
        }(abi.encodeWithSignature(lowerCaseSignature));
        if (!success) {
            (success, data) = address(token).staticcall{gas: 20000}(
                abi.encodeWithSignature(upperCaseSignature)
            );
        }

        if (success && data.length >= 96) {
            (uint256 offset, uint256 len) = abi.decode(
                data,
                (uint256, uint256)
            );
            if (offset == 0x20 && len > 0 && len <= 256) {
                return abi.decode(data, (string));
            }
        }

        if (success && data.length == 32) {
            uint256 len = 0;
            while (
                len < data.length && data[len] >= 0x20 && data[len] <= 0x7E
            ) {
                len++;
            }

            if (len > 0) {
                bytes memory result = new bytes(len);
                unchecked {
                    for (uint256 i = 0; i < len; i++) {
                        result[i] = data[i];
                    }
                }
                return string(result);
            }
        }

        return StringUtil.toHex(address(token));
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory result) = address(token).call(data);
        if (!success) {
            RevertReasonForwarder.reRevert();
        }

        if (result.length > 0) {
            // Return data is optional
            if (!abi.decode(result, (bool))) revert ERC20OperationFailed();
        }
    }
}

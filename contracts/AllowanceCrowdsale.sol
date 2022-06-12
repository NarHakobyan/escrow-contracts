// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./Crowdsale.sol";

/**
 * @title AllowanceCrowdsale
 * @dev Borrow from https://github.dev/OpenZeppelin/openzeppelin-contracts/blob/docs-v2.x/contracts/crowdsale/emission/AllowanceCrowdsale.sol
 * @dev Extension of Crowdsale where tokens are held by a wallet, which approves an allowance to the crowdsale.
 */
abstract contract AllowanceCrowdsale is Crowdsale {
	using SafeERC20 for IERC20;

	address private immutable tokenWallet;

	/**
	 * @dev Constructor, takes token wallet address.
	 * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale.
	 */
	constructor(address _tokenWallet) {
		require(
			_tokenWallet != address(0),
			"AllowanceCrowdsale: token wallet is the zero address"
		);
		tokenWallet = _tokenWallet;
	}

	/**
	 * @dev Checks the amount of tokens left in the allowance.
	 * @return Amount of tokens left in the allowance
	 */
	function remainingTokens() public view returns (uint256) {
		return
			Math.min(
				token.balanceOf(tokenWallet),
				token.allowance(tokenWallet, address(this))
			);
	}

	/**
	 * @dev Overrides parent behavior by transferring tokens from wallet.
	 * @param beneficiary Token purchaser
	 * @param tokenAmount Amount of tokens purchased
	 */
	function _deliverTokens(address beneficiary, uint256 tokenAmount)
		internal
		virtual
		override
	{
		token.safeTransferFrom(tokenWallet, beneficiary, tokenAmount);
	}
}

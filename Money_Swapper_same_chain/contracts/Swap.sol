// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Simple Token Swap
/// @notice Allows swapping TokenA <-> TokenB at a fixed rate.
contract Swap is Ownable {
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public rate; 
    constructor(address _tokenA, address _tokenB, uint256 _rate) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        rate = _rate;
    }

    /// @notice Swap TokenA -> TokenB
    /// @param amountA Amount of TokenA user wants to swap
    function swapAToB(uint256 amountA) external {
        require(tokenA.balanceOf(msg.sender) >= amountA, "Not enough TokenA");
        require(tokenB.balanceOf(address(this)) >= amountA * rate, "Not enough TokenB liquidity");

        tokenA.transferFrom(msg.sender, address(this), amountA);

        tokenB.transfer(msg.sender, amountA * rate);
    }

    /// @notice Add liquidity (owner only)
    function addLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Simple ERC20 Token
/// @notice This token can be minted only by the owner (you).
contract Token is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 initialSupply)
        ERC20(name, symbol)
        Ownable(msg.sender) // set deployer as owner
    {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }

    /// @notice Owner can mint new tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * (10 ** decimals()));
    }
}

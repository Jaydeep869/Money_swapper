// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OptionsBuilder.sol";

/// @notice Simplified LayerZero v2-style app for Remix demo
abstract contract LzApp {
    struct Origin {
        uint32 srcEid;
        bytes32 sender;
    }

    struct MessagingFee {
        uint256 nativeFee;
        uint256 zroFee;
    }

    address public lzEndpoint;

    constructor(address _lzEndpoint) {
        lzEndpoint = _lzEndpoint;
    }

    function _lzSend(
        uint32, // destChainId
        bytes memory, // payload
        bytes memory, // options
        MessagingFee memory, // fee
        address payable // refundAddress
    ) internal virtual {
        // Mock: no real cross-chain in Remix
    }

    function quote(
        uint32,
        bytes memory,
        bytes memory,
        bool
    ) public pure returns (MessagingFee memory) {
        return MessagingFee(0.001 ether, 0); // mock fee
    }
}

contract SwapA is LzApp, Ownable {
    using OptionsBuilder for bytes;

    IERC20 public tokenA;
    uint32 public destChainId;
    address public destSwapAddress;

    constructor(
        address _lzEndpoint,
        address _tokenA,
        uint32 _destChainId,
        address _destSwapAddress
    ) LzApp(_lzEndpoint) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        destChainId = _destChainId;
        destSwapAddress = _destSwapAddress;
    }

    function swapToOther(uint256 amount) external payable {
        require(tokenA.balanceOf(msg.sender) >= amount, "Not enough tokens");
        tokenA.transferFrom(msg.sender, address(this), amount);

        bytes memory payload = abi.encode(msg.sender, amount);
        bytes memory options = OptionsBuilder.newOptions();

        MessagingFee memory fee = quote(destChainId, payload, options, false);
        require(msg.value >= fee.nativeFee, "Not enough fee");

        _lzSend(destChainId, payload, options, fee, payable(msg.sender));
    }

    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata _message,
        address,
        bytes calldata
    ) internal virtual {
        (address to, uint256 amount) = abi.decode(_message, (address, uint256));
        tokenA.transfer(to, amount);
    }
}

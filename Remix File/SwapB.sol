// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./OptionsBuilder.sol";

abstract contract LzAppB {
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
        uint32,
        bytes memory,
        bytes memory,
        MessagingFee memory,
        address payable
    ) internal virtual {}

    function quote(
        uint32,
        bytes memory,
        bytes memory,
        bool
    ) public pure returns (MessagingFee memory) {
        return MessagingFee(0.001 ether, 0);
    }
}

contract SwapB is LzAppB, Ownable {
    using OptionsBuilder for bytes;

    IERC20 public tokenB;
    uint32 public destChainId;
    address public destSwapAddress;

    constructor(
        address _lzEndpoint,
        address _tokenB,
        uint32 _destChainId,
        address _destSwapAddress
    ) LzAppB(_lzEndpoint) Ownable(msg.sender) {
        tokenB = IERC20(_tokenB);
        destChainId = _destChainId;
        destSwapAddress = _destSwapAddress;
    }

    function swapToOther(uint256 amount) external payable {
        require(tokenB.balanceOf(msg.sender) >= amount, "Not enough tokens");
        tokenB.transferFrom(msg.sender, address(this), amount);

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
        tokenB.transfer(to, amount);
    }
}

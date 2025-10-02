// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;
}

interface ILayerZeroReceiver {
    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _fromAddress,
        uint64 _nonce,
        bytes calldata _payload
    ) external;
}

contract CrossChainSwap is Ownable, ReentrancyGuard, ILayerZeroReceiver {
    using SafeERC20 for IERC20;

    ILayerZeroEndpoint public endpoint;
    mapping(address => bool) public supportedTokens;
    mapping(uint16 => bytes) public trustedRemote;

    event SwapInitiated(address indexed user, address indexed token, uint256 amount, uint16 dstChainId, address to);
    event SwapCompleted(address indexed user, address indexed token, uint256 amount, uint16 srcChainId);

    constructor(address _endpoint) Ownable(msg.sender) {
        endpoint = ILayerZeroEndpoint(_endpoint);
    }

    // --- SUPPORT FUNCTIONS ---
    function setSupportedToken(address token, bool status) external onlyOwner {
        supportedTokens[token] = status;
    }

    function isSupportedToken(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    function setTrustedRemote(uint16 _chainId, bytes calldata _remoteAddress) external onlyOwner {
        trustedRemote[_chainId] = _remoteAddress;
    }

    // --- SWAP FUNCTIONS ---
    function initiateSwap(
        address token,
        uint256 amount,
        uint16 dstChainId,
        bytes calldata dstContractAddr,
        address to
    ) external payable nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        
        bytes memory payload = abi.encode(msg.sender, to, token, amount);

        endpoint.send{value: msg.value}(
            dstChainId,
            dstContractAddr,
            payload,
            payable(msg.sender),
            address(0),
            bytes("")
        );

        emit SwapInitiated(msg.sender, token, amount, dstChainId, to);
    }

    function lzReceive(
        uint16 _srcChainId,
        bytes calldata, 
        uint64,
        bytes calldata _payload
    ) external override {
        require(msg.sender == address(endpoint), "Only endpoint");

        (address user, address to, address token, uint256 amount) = abi.decode(
            _payload,
            (address, address, address, uint256)
        );

        require(supportedTokens[token], "Token not supported");

        IERC20(token).safeTransfer(to, amount);

        emit SwapCompleted(user, token, amount, _srcChainId);
    }
}

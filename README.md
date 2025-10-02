# Multi-Chain Token Swapper Project

## Overview

This project is a prototype of a multi-chain token swap application. It allows users to swap custom ERC20 tokens across different blockchains using LayerZero as the cross-chain communication protocol.

## Features

* Deploy custom ERC20 tokens on multiple testnets (Sepolia, Polygon Amoy).
* Swap tokens across chains using LayerZero.
* Track swap history within smart contracts.
* Frontend integration to display token balances and swap functionality.

## Technologies Used

* **Solidity** for smart contract development
* **Hardhat** for deployment and testing
* **Metamask** for wallet interactions
* **LayerZero** for cross-chain messaging
* **React** for the UI

## Project Structure

```
contracts/        # Smart contracts for tokens and swap logic
scripts/          # Deployment and test scripts
frontend/         # Frontend application
artifacts/        # Compiled contract artifacts
README.md         # Project documentation
```

## Steps Completed

1. Developed ERC20 token contracts (`MyTokenA`, `MyTokenB`).
2. Developed a `Swap` contract to handle swaps and record history.
3. Compiled contracts successfully in Hardhat.
4. Connected with Metamask for testing token balances.
5. Integrated LayerZero endpoints for cross-chain swaps.

## Deployment Instructions

1. Set up `.env` with private keys and RPC URLs for your testnets.
2. Compile contracts:

```bash
npx hardhat compile
```

3. Deploy tokens to each chain ( Sepolia, Amoy Polygon testnet):

```bash
npx hardhat run scripts/deployTokenA.js --network sepolia
npx hardhat run scripts/deployTokenB.js --network amoy
```

4. Deploy the `Swap` contract on both chains with LayerZero endpoints.
5. Add token addresses to Metamask for testing.

## Usage

* Connect your wallet (Metamask) to the testnet.
* Use the frontend to swap tokens between chains.
* Check swap history recorded in the `Swap` contract.

## Notes

* Testnets used: Sepolia (Ethereum) and Amoy (Polygon testnet).
* The tokens deployed on testnets are for testing purposes only, not real value.
* LayerZero endpoints are required for cross-chain functionality.

## Future Work

* Complete frontend UI for better user experience.
* Support more chains for multi-chain swaps.
* Implement gas fee optimization for cross-chain swaps.
* Add real-time swap status notifications.

## References

* [LayerZero Docs](https://docs.layerzero.network/v1/concepts/layerzero-endpoint)
* [Hardhat](https://hardhat.org/)
* [ERC20 Token Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)

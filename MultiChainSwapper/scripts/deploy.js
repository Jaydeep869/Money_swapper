const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const endpoint = hre.network.name === "sepolia" 
      ? process.env.SEPOLIA_LAYERZERO_ENDPOINT 
      : process.env.AMOY_LAYERZERO_ENDPOINT;

  const Swap = await hre.ethers.getContractFactory("CrossChainSwap");
  const swap = await Swap.deploy(endpoint);
  await swap.deployed();

  console.log("Contract deployed at:", swap.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TokenA with account:", deployer.address);

  const TokenA = await ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy(ethers.utils.parseEther("1000000")); 

  console.log("TokenA deployed at:", tokenA.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

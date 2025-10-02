const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TokenB with account:", deployer.address);

  const TokenB = await ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy(ethers.utils.parseEther("1000000")); 

  console.log("TokenB deployed at:", tokenB.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

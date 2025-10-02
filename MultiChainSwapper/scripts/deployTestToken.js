const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TestToken with deployer:", deployer.address);

  // Customize your token name and symbol
  const name = "TestToken";
  const symbol = "TTK";

  const Token = await ethers.getContractFactory("TestToken");
  const token = await Token.deploy(name, symbol);

  await token.deployed();
  console.log(`TestToken deployed at: ${token.address}`);

  // Mint some tokens to deployer for testing swaps
  const mintAmount = ethers.utils.parseUnits("1000", 18); // 1000 tokens
  const tx = await token.mint(deployer.address, mintAmount);
  await tx.wait();
  console.log(`Minted ${ethers.utils.formatUnits(mintAmount, 18)} tokens to deployer`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

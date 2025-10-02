const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Swap contract with account:", deployer.address);

  const tokenAAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const tokenBAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

  const Swap = await ethers.getContractFactory("Swap");
  const swap = await Swap.deploy(tokenAAddress, tokenBAddress, 2); 
  await swap.deployed();

  console.log("Swap contract deployed at:", swap.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

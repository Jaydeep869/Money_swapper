const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenAAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const tokenBAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
  const swapAddress   = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";

  const tokenA = await ethers.getContractAt("TokenA", tokenAAddress);
  const tokenB = await ethers.getContractAt("TokenB", tokenBAddress);

  // Mint 1000 TokenA to deployer (multiply by 10^18)
  const amountA = ethers.BigNumber.from("1000").mul(ethers.BigNumber.from("10").pow(18));
await tokenA.transfer(swapAddress, amountA);
console.log("Funded Swap contract with 1000 TokenA");

const amountB = ethers.BigNumber.from("1000").mul(ethers.BigNumber.from("10").pow(18));
await tokenB.transfer(swapAddress, amountB);
console.log("Funded Swap contract with 1000 TokenB");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

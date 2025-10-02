const { ethers } = require("hardhat");

async function checkFunctions() {
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);
  
  console.log("Available functions in contract:");
  Object.keys(Swap.functions).forEach(func => {
    console.log("-", func);
  });
}

checkFunctions().catch(console.error);
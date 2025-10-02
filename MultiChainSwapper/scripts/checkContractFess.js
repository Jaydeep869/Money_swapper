const { ethers } = require("hardhat");

async function checkContractFee() {
  const [signer] = await ethers.getSigners();
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);

  console.log("Checking contract for fee-related functions...");
  
  // Try to find any fee-related view functions
  const viewFunctions = [
    'minFee', 'MIN_FEE', 'getMinFee', 'defaultFee', 
    'DEFAULT_FEE', 'getDefaultFee', 'fee', 'getFee'
  ];

  for (const funcName of viewFunctions) {
    try {
      if (Swap[funcName]) {
        const result = await Swap[funcName]();
        console.log(`✓ ${funcName}:`, ethers.utils.formatEther(result), "ETH");
      }
    } catch (err) {
      // Function doesn't exist or requires parameters
    }
  }

  // Check contract ETH balance
  const contractBalance = await ethers.provider.getBalance(SWAP_CONTRACT_ADDRESS);
  console.log("Contract ETH balance:", ethers.utils.formatEther(contractBalance), "ETH");
}

checkContractFee().catch(console.error);
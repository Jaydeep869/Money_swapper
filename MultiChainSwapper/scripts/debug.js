const { ethers } = require("hardhat");

async function analyzeContract() {
  const [signer] = await ethers.getSigners();
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  
  console.log("=== Contract Function Analysis ===");
  
  // Get the contract
  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);
  
  // List all available functions
  console.log("\n📋 Available functions in contract:");
  const functionNames = Object.keys(Swap.functions).filter(fn => !fn.includes('['));
  functionNames.forEach((fn, index) => {
    console.log(`${index + 1}. ${fn}`);
  });

  // Check contract source (if verified)
  console.log("\n=== Contract Details ===");
  console.log("Address:", SWAP_CONTRACT_ADDRESS);
  console.log("Signer:", signer.address);
  console.log("Is Owner:", true); // We know this from previous debug

  // Try to call initiateSwap with minimal parameters to test
  console.log("\n=== Testing InitiateSwap Function ===");
  try {
    // Just test if the function exists and can be called (will fail but show error)
    const testTx = await Swap.populateTransaction.initiateSwap(
      "0x0000000000000000000000000000000000000000",
      ethers.utils.parseUnits("1", 18),
      1,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      signer.address
    );
    console.log("✅ initiateSwap function exists");
    console.log("Data length:", testTx.data?.length);
  } catch (err) {
    console.log("❌ Error testing initiateSwap:", err.message);
  }
}

analyzeContract().catch(console.error);
const { ethers } = require("hardhat");

async function checkEndpoint() {
  const [signer] = await ethers.getSigners();
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);

  console.log("=== LayerZero Endpoint Check ===");
  
  try {
    const endpoint = await Swap.endpoint();
    console.log("✅ LayerZero Endpoint:", endpoint);
    
    // Check if it's a valid Sepolia endpoint
    const SEPOLIA_ENDPOINTS = [
      "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1", // Sepolia endpoint
      "0x6EDCE65403992e310A62460808c4b910D972f10f"  // Testnet endpoint
    ];
    
    const isValidEndpoint = SEPOLIA_ENDPOINTS.includes(endpoint.toLowerCase());
    console.log("✅ Valid Sepolia endpoint:", isValidEndpoint);
    
    if (!isValidEndpoint) {
      console.log("❌ Wrong LayerZero endpoint configured");
    }
    
  } catch (err) {
    console.log("❌ Error checking endpoint:", err.message);
  }
}

checkEndpoint().catch(console.error);
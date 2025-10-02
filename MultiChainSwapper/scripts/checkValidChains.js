const { ethers } = require("hardhat");

async function checkValidChains() {
  console.log("=== Valid LayerZero Chain IDs ===");
  
  // LayerZero testnet chain IDs
  const LZ_TESTNET_CHAINS = {
    10121: "Ethereum Goerli",
    10143: "Arbitrum Goerli", 
    10132: "Optimism Goerli",
    10109: "Avalanche Fuji",
    10112: "Polygon Mumbai",
    10106: "BNB Chain Testnet",
    10161: "Ethereum Sepolia"  // This might be Sepolia
  };

  console.log("Your current destination chain: 109");
  console.log("\nValid LayerZero testnet chain IDs:");
  Object.entries(LZ_TESTNET_CHAINS).forEach(([id, name]) => {
    console.log(`- ${id}: ${name}`);
  });

  console.log("\n⚠️  Chain 109 is likely invalid!");
  console.log("💡 Try using 10161 for Sepolia or 10121 for Goerli");
}

checkValidChains().catch(console.error);
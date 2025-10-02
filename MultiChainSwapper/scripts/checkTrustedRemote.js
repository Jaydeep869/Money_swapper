const { ethers } = require("hardhat");

async function checkTrustedRemote() {
  const [signer] = await ethers.getSigners();
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);

  console.log("=== Trusted Remote Check ===");
  
  try {
    const trustedRemote = await Swap.trustedRemote(109);
    console.log("Trusted remote for chain 109:", trustedRemote);
    
    if (trustedRemote === "0x") {
      console.log("❌ No trusted remote configured for chain 109");
      console.log("You need to set up the trusted remote first!");
    } else {
      console.log("✅ Trusted remote is configured");
      // Decode the trusted remote
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ["address", "address"],
        trustedRemote
      );
      console.log("Remote address:", decoded[0]);
      console.log("Local address:", decoded[1]);
    }
    
  } catch (err) {
    console.log("❌ Error checking trusted remote:", err.message);
  }
}

checkTrustedRemote().catch(console.error);
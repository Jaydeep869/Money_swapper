const { ethers } = require("hardhat");

async function approveTokens() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  const TOKEN_ADDRESS = "0x3e3180C20FB369D125cAa33439199ccf7EE71990";
  
  // Approve a larger amount for future swaps
  const AMOUNT = ethers.utils.parseUnits("1000", 18); // 1000 tokens

  const Token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);
  
  // Check current allowance
  const currentAllowance = await Token.allowance(signer.address, SWAP_CONTRACT_ADDRESS);
  console.log("Current allowance:", ethers.utils.formatUnits(currentAllowance, 18));
  
  console.log("Approving tokens...");
  const tx = await Token.approve(SWAP_CONTRACT_ADDRESS, AMOUNT);
  console.log("Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("✅ Tokens approved! Block:", receipt.blockNumber);
  
  // Verify new allowance
  const newAllowance = await Token.allowance(signer.address, SWAP_CONTRACT_ADDRESS);
  console.log("New allowance:", ethers.utils.formatUnits(newAllowance, 18));
}

approveTokens().catch(console.error);
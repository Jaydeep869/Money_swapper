const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Config
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544";
  const TOKEN_ADDRESS = "0x3e3180C20FB369D125cAa33439199ccf7EE71990";
  const DST_CHAIN_ID = 109;
  const DST_SWAP_ADDRESS = "0x3D132431a771676DC84079bEC64D19b149C3F44E";
  const AMOUNT = ethers.utils.parseUnits("1", 18); // 1 token

  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);
  const Token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);

  console.log("=== Pre-flight Checks ===");
  
  // 1. Check ETH balance first
  const ethBalance = await ethers.provider.getBalance(signer.address);
  console.log("ETH balance:", ethers.utils.formatEther(ethBalance), "ETH");
  
  if (ethBalance.lt(ethers.utils.parseEther("0.001"))) {
    throw new Error("Insufficient ETH balance. Need at least 0.001 ETH for transaction gas");
  }

  // 2. Check token balance
  const tokenBalance = await Token.balanceOf(signer.address);
  console.log("Token balance:", ethers.utils.formatUnits(tokenBalance, 18));
  
  if (tokenBalance.lt(AMOUNT)) {
    throw new Error(`Insufficient token balance. Need 1.0 tokens, but have ${ethers.utils.formatUnits(tokenBalance, 18)}`);
  }

  // 3. Check allowance
  const allowance = await Token.allowance(signer.address, SWAP_CONTRACT_ADDRESS);
  console.log("Allowance:", ethers.utils.formatUnits(allowance, 18));
  
  if (allowance.lt(AMOUNT)) {
    throw new Error(`Insufficient allowance. Need at least 1.0 tokens approved`);
  }
  console.log("✓ Allowance sufficient");

  // 4. Calculate optimal fee (use 80% of balance, keep 20% for gas)
  const ethBalanceWei = await ethers.provider.getBalance(signer.address);
  const estimatedGasCost = ethers.utils.parseEther("0.0005"); // Estimated gas cost ~0.0005 ETH
  const maxAvailableForFee = ethBalanceWei.sub(estimatedGasCost);
  
  // Use minimum between calculated fee and available balance
  const baseFee = ethers.utils.parseEther("0.001"); // Start with 0.001 ETH
  const fee = maxAvailableForFee.lt(baseFee) ? maxAvailableForFee : baseFee;
  
  console.log(`Using fee: ${ethers.utils.formatEther(fee)} ETH`);
  console.log(`Remaining for gas: ${ethers.utils.formatEther(ethBalanceWei.sub(fee))} ETH`);

  // 5. Verify contract is ready
  console.log("\n=== Contract Verification ===");
  try {
    const isSupported = await Swap.supportedTokens(TOKEN_ADDRESS);
    console.log("Token supported:", isSupported);
    
    if (!isSupported) {
      throw new Error("Token is not supported by the swap contract");
    }
  } catch (err) {
    console.error("Contract verification failed:", err.message);
    return;
  }

  console.log("\n=== Executing Cross-Chain Swap ===");
  console.log(`From: Sepolia (Chain ${await signer.getChainId()})`);
  console.log(`To: Chain ${DST_CHAIN_ID}`);
  console.log(`Amount: 1.0 tokens`);
  console.log(`Fee: ${ethers.utils.formatEther(fee)} ETH`);
  
  const maxRetries = 2;
  let gasLimit = 250000; // Start with conservative gas limit

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n--- Attempt ${attempt}/${maxRetries} ---`);
      console.log(`Gas limit: ${gasLimit}`);

      const tx = await Swap.initiateSwap(
        TOKEN_ADDRESS,
        AMOUNT,
        DST_CHAIN_ID,
        ethers.utils.hexZeroPad(DST_SWAP_ADDRESS, 32),
        signer.address,
        {
          value: fee,
          gasLimit: gasLimit
        }
      );

      console.log("✅ Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("\n🎉 Cross-chain swap initiated successfully!");
      console.log("Transaction hash:", receipt.transactionHash);
      console.log("Block number:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
      console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
      
      // Check if this is a LayerZero transaction
      if (receipt.logs) {
        const layerZeroLogs = receipt.logs.filter(log => 
          log.topics && log.topics[0] === ethers.utils.id("PacketSent(bytes)")
        );
        if (layerZeroLogs.length > 0) {
          console.log("🔗 LayerZero message sent successfully");
        }
      }
      
      return; // Success, exit function

    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      
      if (err.reason) {
        console.error("Revert reason:", err.reason);
      }
      
      // Provide specific error guidance
      if (err.message.includes("insufficient funds")) {
        console.error("💡 Solution: Get more Sepolia ETH from a faucet");
        break;
      } else if (err.message.includes("allowance")) {
        console.error("💡 Solution: Increase token allowance");
        break;
      } else if (err.message.includes("reverted")) {
        console.error("💡 Solution: Check contract parameters and destination chain setup");
      }

      if (attempt === maxRetries) {
        console.error("\n💥 All attempts failed. Possible solutions:");
        console.error("1. Get more Sepolia ETH from: https://sepoliafaucet.com/");
        console.error("2. Check if destination chain ID is correct");
        console.error("3. Verify destination contract address");
        console.error("4. Try with a smaller amount");
        break;
      }

      // Increase gas limit for next attempt
      gasLimit = Math.floor(gasLimit * 1.3);
      console.log(`Retrying with increased gas limit: ${gasLimit}`);
      
      // Add delay between retries
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

main()
  .then(() => {
    console.log("\n✨ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error.message);
    process.exit(1);
  });
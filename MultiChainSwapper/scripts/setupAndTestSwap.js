const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // --- Config ---
  const SWAP_CONTRACT_ADDRESS = "0xfB967162Bb0FA09806E26526D6DE5CDD2b039544"; // Sepolia Swap contract
  const TOKEN_ADDRESS = "0x3e3180C20FB369D125cAa33439199ccf7EE71990";       // Sepolia TestToken
  const DST_CHAIN_ID = 109;   // Destination chain
  const DST_SWAP_ADDRESS = "0x3D132431a771676DC84079bEC64D19b149C3F44E"; // Destination Swap contract
  const AMOUNT = ethers.utils.parseUnits("1", 18); // 1 token

  // --- Step 1: Check balances first ---
  const ethBalance = await ethers.provider.getBalance(signer.address);
  console.log("ETH Balance:", ethers.utils.formatEther(ethBalance), "ETH");
  
  const tokenBalance = await ethers.getContractAt("IERC20", TOKEN_ADDRESS)
    .then(token => token.balanceOf(signer.address));
  console.log("Token Balance:", ethers.utils.formatUnits(tokenBalance, 18), "tokens");

  if (tokenBalance.lt(AMOUNT)) {
    throw new Error(`Insufficient token balance. Have: ${ethers.utils.formatUnits(tokenBalance, 18)}, Need: 1`);
  }

  // --- Step 2: Connect to deployed Swap contract ---
  const Swap = await ethers.getContractAt("CrossChainSwap", SWAP_CONTRACT_ADDRESS);
  
  // Verify contract is deployed
  const code = await ethers.provider.getCode(SWAP_CONTRACT_ADDRESS);
  if (code === '0x') {
    throw new Error("Swap contract not deployed at the specified address");
  }
  console.log("Swap contract verified ✅");

  // --- Step 3: Ensure token is supported ---
  try {
    const isSupported = await Swap.supportedTokens(TOKEN_ADDRESS);
    if (!isSupported) {
      console.log("Token not supported, adding it...");
      const tx = await Swap.setSupportedToken(TOKEN_ADDRESS, true);
      await tx.wait();
      console.log("Token supported ✅");
    } else {
      console.log("Token already supported ✅");
    }
  } catch (err) {
    console.warn("Could not check token support, continuing...", err.reason || err.message);
  }

  // --- Step 4: Connect token contract ---
  const Token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);

  // --- Step 5: Check and set allowance ---
  const allowance = await Token.allowance(signer.address, SWAP_CONTRACT_ADDRESS);
  console.log("Current allowance:", ethers.utils.formatUnits(allowance, 18));
  
  if (allowance.lt(AMOUNT)) {
    console.log("Approving token...");
    const tx = await Token.approve(SWAP_CONTRACT_ADDRESS, AMOUNT);
    const receipt = await tx.wait();
    console.log("Token approved ✅ Tx:", receipt.transactionHash);
    
    // Verify approval
    const newAllowance = await Token.allowance(signer.address, SWAP_CONTRACT_ADDRESS);
    console.log("New allowance:", ethers.utils.formatUnits(newAllowance, 18));
  } else {
    console.log("Sufficient allowance already ✅");
  }

  // --- Step 6: Estimate LayerZero fees ---
  let fee;
  try {
    fee = await Swap.estimateFees(
      DST_CHAIN_ID,
      ethers.utils.hexlify(ethers.utils.zeroPad(DST_SWAP_ADDRESS, 32)), // Proper address formatting
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "address", "uint256"],
        [signer.address, signer.address, TOKEN_ADDRESS, AMOUNT]
      ),
      false, // _payInZRO
      "0x" // _adapterParams (empty for default)
    );
    console.log("Estimated LayerZero fee:", ethers.utils.formatEther(fee), "ETH");
    
    // Check if user has enough ETH for fees
    if (ethBalance.lt(fee)) {
      throw new Error(`Insufficient ETH for fees. Need: ${ethers.utils.formatEther(fee)} ETH, Have: ${ethers.utils.formatEther(ethBalance)} ETH`);
    }
  } catch (err) {
    console.error("Fee estimation failed:", err.reason || err.message);
    // Use a safe fallback fee
    fee = ethers.utils.parseEther("0.005"); // 0.005 ETH fallback
    console.log("Using fallback fee:", ethers.utils.formatEther(fee), "ETH");
  }

  // --- Step 7: Execute swap with proper error handling ---
  const maxRetries = 3;
  let gasLimit = 400000; // Start with reasonable gas limit

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n--- Attempt ${attempt}/${maxRetries} ---`);
      console.log(`Gas limit: ${gasLimit}`);
      console.log(`Fee: ${ethers.utils.formatEther(fee)} ETH`);
      
      const tx = await Swap.initiateSwap(
        TOKEN_ADDRESS,
        AMOUNT,
        DST_CHAIN_ID,
        ethers.utils.hexlify(ethers.utils.zeroPad(DST_SWAP_ADDRESS, 32)), // Proper bytes formatting
        signer.address,
        {
          value: fee,
          gasLimit: gasLimit
        }
      );
      
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Swap successful!");
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
      console.log("Transaction hash:", receipt.transactionHash);
      
      break; // Exit loop if successful
      
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.reason || err.message);
      
      if (attempt === maxRetries) {
        console.error("All retry attempts failed. Exiting.");
        
        // Provide helpful error messages
        if (err.reason?.includes("insufficient funds")) {
          console.error("💡 Tip: Add more ETH to your wallet for gas fees");
        } else if (err.reason?.includes("allowance")) {
          console.error("💡 Tip: Check token approval transaction");
        } else if (err.reason?.includes("reverted")) {
          console.error("💡 Tip: Contract execution reverted. Check parameters and contract state");
        }
        
        process.exit(1);
      }
      
      // Increase gas limit for next attempt
      gasLimit = Math.floor(gasLimit * 1.3);
      console.log(`Retrying with increased gas limit: ${gasLimit}`);
      
      // Add delay between retries
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Handle script execution
main()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n💥 Script failed:", err.message);
    process.exit(1);
  });
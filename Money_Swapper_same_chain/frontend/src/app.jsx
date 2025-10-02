import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import SwapJson from "./Swap.json";

const swapABI = SwapJson.abi;

export function App() {
  const [account, setAccount] = useState(null);
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [swapHistory, setSwapHistory] = useState([]);

  const SWAP_ADDRESS = import.meta.env.VITE_SWAP_ADDRESS;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Install MetaMask!");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      console.log("Connected account:", userAddress);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  // Fetch swap history from backend
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/swaps`);
      setSwapHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch swap history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Swap tokens
  const handleSwap = async () => {
    if (!account) return alert("Connect wallet first");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const swapContract = new ethers.Contract(SWAP_ADDRESS, swapABI, signer);

      // Get TokenA address
      const tokenAAddress = await swapContract.tokenA();


      // Minimal ERC20 approve ABI
      const tokenAContract = new ethers.Contract(
  tokenAAddress,
  [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
  ],
  signer
);

const amountInWei = ethers.parseEther(tokenAAmount);


      // Approve TokenA
      const approveTx = await tokenAContract.approve(SWAP_ADDRESS, amountInWei);
      await approveTx.wait();
      console.log("TokenA approved");

      // Swap
      const swapTx = await swapContract.swapAToB(amountInWei);
      await swapTx.wait();
      console.log("Swap successful");

      // Send swap data to backend
      await axios.post(`${BACKEND_URL}/swap`, {
        user: account,
        tokenAAmount,
        tokenBAmount: (parseFloat(tokenAAmount) * 2).toString(),
      });

      alert("Swap successful!");
      setTokenAAmount("");
      fetchHistory();
    } catch (err) {
      console.error("Swap failed:", err);
      alert(`Swap failed: ${err.message || err}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Money Swapper</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <input
        type="text"
        placeholder="Amount TokenA"
        value={tokenAAmount}
        onChange={(e) => setTokenAAmount(e.target.value)}
      />
      <button onClick={handleSwap}>Swap TokenA → TokenB</button>

      <h3>Swap History</h3>
      <ul>
        {swapHistory.map((s) => (
          <li key={s._id}>
            {s.user}: {s.tokenAAmount} → {s.tokenBAmount}
          </li>
        ))}
      </ul>
    </div>
  );
}

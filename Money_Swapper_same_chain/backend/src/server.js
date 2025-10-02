import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import SwapHistory from "./models/SwapHistory.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("✅ MongoDB connected successfully"))
  .catch((err)=> console.error("❌ MongoDB connection error:", err));


// Record a swap
app.post("/swap", async (req, res) => {
  try {
    const { user, tokenAAmount, tokenBAmount } = req.body;
    const swap = await SwapHistory.create({ user, tokenAAmount, tokenBAmount });
    res.json(swap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get swap history
app.get("/swaps", async (req, res) => {
  try {
    const swaps = await SwapHistory.find().sort({ timestamp: -1 });
    res.json(swaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

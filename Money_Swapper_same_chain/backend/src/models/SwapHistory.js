import mongoose from "mongoose";

const swapHistorySchema = new mongoose.Schema({
  user: String,
  tokenAAmount: String,
  tokenBAmount: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("SwapHistory", swapHistorySchema, "swaphistories");


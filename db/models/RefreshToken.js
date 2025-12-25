const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  revokedAt: { type: Date },
  replacedByToken: { type: String },
  ip: String,
  userAgent: String,
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
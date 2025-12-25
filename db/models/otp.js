const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  email: { type: String, index: true },
  userid:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  code: String,
  payload: mongoose.Schema.Types.Mixed,
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, index: { expireAfterSeconds: 100000 } }
}, { timestamps: true });

module.exports = {
  Otp: mongoose.model("Otp", OtpSchema)
};
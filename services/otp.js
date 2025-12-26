const { Otp } = require("../db/models/otp.js");
const { sendOtpEmail } = require("../services/email.js");
const env = require("../config/prod.json")
const OTP_TTL_SECONDS = Number(env.SMTP.OTP_TTL_SECONDS || 600);
const msg = require('../utils/message.js')

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

const createOtp=async(email, payload = {}) => {
  const code = generateCode();
  const otp = await Otp.create({
    email,
    code,
    payload,
    expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000)
  });
  await sendOtpEmail(email, code);
  return otp;
}

const verifyOtp=async(email, code) => {
  const otp = await Otp.findOne({ email, code, used: false });
  if (!otp) return { valid: false, message: msg.INVALID_OTP };
  if (otp.expiresAt < new Date()) return { valid: false, message: msg.OTP_EXPIRED };
  otp.used = true;
  await otp.save();
  return { valid: true, payload: otp.payload };
}

module.exports = { createOtp, verifyOtp };
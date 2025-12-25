const jwt = require("jsonwebtoken");

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExp = process.env.JWT_ACCESS_EXPIRES || "15m";
const refreshExp = process.env.JWT_REFRESH_EXPIRES || "7d";

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set");
}

function signAccess(payload) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExp });
}
function signRefresh(payload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExp });
}
function verifyAccess(token) {
  return jwt.verify(token, accessSecret);
}
function verifyRefresh(token) {
  return jwt.verify(token, refreshSecret);
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
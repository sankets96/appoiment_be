const jwt = require("jsonwebtoken");
const env =require('../../config/prod.json');
const msg = require("../utils/message");

const accessSecret = env.App.secretkey;
const refreshSecret = env.App.refreshSecretkey;
const accessExp =  env.App.accessExp || "15m";
const refreshExp = env.App.refreshExp || "7d";

if (!accessSecret || !refreshSecret) {
  throw new Error(msg.JWT_ACCESS_SECRET_MUST_BE_SET);
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
const crypto = require("crypto");
const RefreshToken = require("../db/models/RefreshToken"); 
const { verifyRefresh } = require("./jwt.services"); 

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function saveRefreshToken(userId, token, ttlSeconds, meta = {}) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const doc = await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(token),
    expiresAt,
    ...meta,
  });
  return doc;
}

async function revokeRefreshTokenByHash(hash, replaceByToken) {
  const rt = await RefreshToken.findOne({ tokenHash: hash });
  if (!rt) return null;
  rt.revokedAt = new Date();
  rt.replacedByToken = replaceByToken;
  await rt.save();
  return rt;
}

async function isRefreshTokenValid(token) {
  try {
    const payload = verifyRefresh(token);
    const hash = hashToken(token);
    const doc = await RefreshToken.findOne({ tokenHash: hash, user: payload.sub });
    if (!doc || doc.revokedAt || doc.expiresAt < new Date()) return null;
    return { payload, doc };
  } catch (e) {
    return null;
  }
}

module.exports = { hashToken, saveRefreshToken, revokeRefreshTokenByHash, isRefreshTokenValid };
// middlewares/auth.js
const { verifyAccess } = require("../auth/jwt.services"); // adjust path to your file

function requireAuth(req, res, next) {
  const authHeader = req.header("Authorization") || "";
  // support Bearer token and optional cookie fallback
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : (req.cookies && req.cookies.accessToken);

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = verifyAccess(token);
    req.user = payload; // attach user info for downstream handlers
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// optional: role-based guard
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
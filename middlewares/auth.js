// middlewares/auth.js
const { verifyAccess } = require("../auth/jwt.services.js"); 

// function requireAuth(req, res, next) {
//   // Prefer token from `x-access-token` header (common in some clients)
//   // Fallbacks: Authorization: Bearer <token>, then cookies.accessToken
//   const xToken = req.header("x-access-token");
//   const authHeader = req.header("Authorization") || "";
//   const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
//   const token = xToken || bearerToken || (req.cookies && req.cookies.accessToken);  

//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const payload = verifyAccess(token);
//     req.user = payload; 
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// }

//role-based Auth


// function requireAuth(req, res, next) {
//   // If this request is not in the protected list, skip auth
//   if (!isProtected(req)) return next();

//   // Prefer token from `x-access-token` header (common in some clients)
//   // Fallbacks: Authorization: Bearer <token>, then cookies.accessToken
//   const xToken = req.header("x-access-token");
//   const authHeader = req.header("Authorization") || "";
//   const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
//   const token = xToken || bearerToken || (req.cookies && req.cookies.accessToken);  

//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const payload = verifyAccess(token);
//     req.user = payload; 
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// }
// function requireRole(...roles) {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }
//     next();
//   };
// }
function requireAuth(req, res, next) {
  const xToken = req.header("x-access-token");
  const authHeader = req.header("Authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token =
    xToken ||
    bearerToken ||
    (req.cookies && req.cookies.accessToken);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = verifyAccess(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Role-based middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
module.exports = { requireAuth, requireRole };
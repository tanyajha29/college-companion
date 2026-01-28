import jwt from "jsonwebtoken";

// ✅ Core middleware: Verify JWT
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "AUTH_HEADER_MISSING_OR_INVALID" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: "AUTH_INVALID_TOKEN" });
    }

    req.user = {
      userId: decoded.userId || decoded.userid,
      // ✅ FIX: Ensure role is always lowercase for consistent checks.
      role: decoded.role ? decoded.role.toLowerCase() : undefined,
      username: decoded.username,
    };

    next();
  });
}

// ✅ Role-based Access Control (RBAC)
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: "AUTH_FORBIDDEN_NO_ROLE" });
    }
    
    // The role check is now case-insensitive because of the fix above.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "AUTH_FORBIDDEN_INSUFFICIENT_PERMISSIONS" });
    }

    next();
  };
}

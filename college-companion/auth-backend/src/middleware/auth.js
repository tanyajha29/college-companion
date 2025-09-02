import jwt from "jsonwebtoken";

// ✅ Core middleware: Verify JWT
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ success: false, error: "AUTH_HEADER_MISSING" });
  }

  // Ensure proper "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, error: "AUTH_NO_TOKEN" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: "AUTH_INVALID_TOKEN" });
    }

    // Attach user details from decoded token
    req.user = {
      user_id: decoded.user_id || decoded.id, // handle both naming styles
      role: decoded.role,
    };

    next();
  });
}

// ✅ Role-based Access Control (RBAC)
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "AUTH_NOT_AUTHENTICATED" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "AUTH_FORBIDDEN" });
    }

    next();
  };
}

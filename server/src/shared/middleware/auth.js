import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "AUTH_HEADER_MISSING_OR_INVALID" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, env.jwtSecret, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ success: false, error: "AUTH_INVALID_TOKEN" });
    }

    req.user = {
      userId: decoded.userId || decoded.userid,
      role: decoded.role ? decoded.role.toLowerCase() : undefined,
      username: decoded.username,
    };

    next();
  });
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: "AUTH_FORBIDDEN_NO_ROLE" });
    }

    const lowerRoles = roles.map((r) => r.toLowerCase());

    if (!lowerRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "AUTH_FORBIDDEN_INSUFFICIENT_PERMISSIONS" });
    }

    next();
  };
}

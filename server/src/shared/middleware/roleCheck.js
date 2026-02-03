export default function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Forbidden: no role." });
    }
    const normalized = req.user.role.toLowerCase();
    const allowed = allowedRoles.map((r) => r.toLowerCase());
    if (!allowed.includes(normalized)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions." });
    }
    next();
  };
}

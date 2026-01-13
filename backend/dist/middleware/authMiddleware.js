import { verifyAccessToken } from "../utils/jwt.js";
// Validates JWT access token and attaches user info to the request object.
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res
            .status(401)
            .json({ message: "Missing or invalid authorization header." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = verifyAccessToken(token);
        if (payload.type !== "access") {
            res.status(401).json({ message: "Invalid token type." });
            return;
        }
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token." });
    }
}
// Authorizes the request based on the user's role.
export function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res
                .status(403)
                .json({ message: "Access denied. Insufficient permissions." });
            return;
        }
        next();
    };
}

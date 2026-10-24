import jwt from "jsonwebtoken";
import { User } from "./models.js";

const SECRET = () => process.env.JWT_SECRET || "dev-only-secret-change-me";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const signToken = (user) => jwt.sign({ sub: String(user._id), role: user.role }, SECRET(), { expiresIn: "7d" });

export const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, title: u.title?.fr ? u.title : undefined });

// Requires a valid "Authorization: Bearer <token>" header, optionally with a given role
export function requireUser(role) {
  return async (req, _res, next) => {
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    let payload;
    try { payload = jwt.verify(token, SECRET()); } catch { throw new HttpError(401, "Please sign in"); }
    const user = await User.findById(payload.sub).lean();
    if (!user) throw new HttpError(401, "Please sign in");
    if (role && user.role !== role) throw new HttpError(403, "Not allowed for your account");
    req.user = user;
    next();
  };
}

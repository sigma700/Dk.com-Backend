import jwt from "jsonwebtoken";
import "dotenv/config";

export const attachUserId = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  // 2. If not, try cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(); // no token → guest
  }

  try {
    const decoded = jwt.verify(token, process.env.WEBTOKEN);
    req.user = decoded; // attach user info

    next();
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
};

export const setOwner = (req, res, next) => {
  if (req.user && req.user.userId) {
    // ✅ use correct field name
    req.owner = {field: "user", value: req.user.userId};
  } else if (req.session && req.session.id) {
    req.owner = {field: "sessionId", value: req.session.id};
  } else {
    // Guest without session – still allow request, but owner is null/undefined
    req.owner = null; // or set to a default guest ID if needed
  }
  next();
};

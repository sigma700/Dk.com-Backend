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
    req.user = {id: decoded.userId}; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
};

export const setOwner = (req, res, next) => {
  if (req.user && req.user.id) {
    // after auth middleware
    req.owner = {field: "user", value: req.user.id};
  } else if (req.session && req.session.id) {
    // from express-session
    req.owner = {field: "sessionId", value: req.session.id};
  } else {
    // Fallback – should not happen if session is always present
    return res.status(500).json({error: "No session"});
  }
  next();
};

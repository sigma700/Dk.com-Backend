import jwt from "jsonwebtoken";
import "dotenv/config";

export const atatchUserId = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // no token → continue as guest
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.WEBTOKEN);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({error: "Invalid token"});
  }
};

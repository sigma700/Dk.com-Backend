//logic for creating the JWT token so that we can have a cookie in each login or account creation logic
import jwt from "jsonwebtoken";
import "dotenv/config"; //to allow reading of the env file

export const generateJwt = (res, userId) => {
  //attatch it to the userId
  if (!process.env.WEBTOKEN) {
    throw new Error("JWT secret key appears to be undefined !");
  }

  const token = jwt.sign({userId: userId}, process.env.WEBTOKEN, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return token;
};

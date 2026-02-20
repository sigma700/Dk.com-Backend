import {Router} from "express";
import {
  createAccount,
  logintoAccount,
  verifyEmail,
} from "../controllers/accountOperations.js";

export const userRouter = Router();

userRouter.post("/create-account", createAccount);
userRouter.get("/login", logintoAccount);
userRouter.get("/verify", verifyEmail);

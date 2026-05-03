import {Router} from "express";
import {
  createAccount,
  logintoAccount,
  verifyEmail,
} from "../controllers/accountOperations.js";
import {checkAuth} from "../controllers/middleWareController.js";
import {attachUserId} from "../../utils/decodeJwt.js";

export const userRouter = Router();

userRouter.post("/create-account", createAccount);
userRouter.post("/login", logintoAccount);
userRouter.post("/verify", verifyEmail);
userRouter.get("/checkAuth", attachUserId, checkAuth);

//THIS IS THE PAGE THAT I WILL USE TO INITIATE PAYMENTS

import {Router} from "express";
import {
  acceptPayment,
  initiatePayment,
} from "../controllers/paymentController.js";

export const paymentRouter = Router();

// paymentRouter.get("/getToken", getAccessToken);
paymentRouter.post("/makePayment/:orderId", initiatePayment);
paymentRouter.post("/paymentTest", acceptPayment);

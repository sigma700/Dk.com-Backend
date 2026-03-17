//THIS IS THE PAGE THAT I WILL USE TO INITIATE PAYMENTS

import {Router} from "express";
import {
  acceptPayment,
  initiatePayments,
} from "../controllers/paymentController.js";
import {getAccessToken} from "../../utils/payments.js";

export const paymentRouter = Router();

paymentRouter.get("/getToken", getAccessToken);
paymentRouter.post("/makePayment/:orderId", initiatePayments);
paymentRouter.post("/paymentTest", acceptPayment);

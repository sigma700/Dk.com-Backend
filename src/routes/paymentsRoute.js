//THIS IS THE PAGE THAT I WILL USE TO INITIATE PAYMENTS

import {Router} from "express";
import {initiatePayments} from "../controllers/paymentController.js";
import {getAccessToken} from "../../utils/payments.js";

export const paymentRouter = Router();

paymentRouter.post("/acceptPayment", initiatePayments);
paymentRouter.get("/getToken", getAccessToken);

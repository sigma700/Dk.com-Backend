import axios from "axios";
import {paystackRequest} from "../../utils/payments.js";
import "dotenv/config";
import {Order} from "../database/models/storeSchema.js";
import {formatPhone} from "../../utils/numberFormater.js";
import {Payment} from "../database/models/paymentSchema.js";

export const initiatePayment = async (req, res) => {
  try {
    const {orderId} = req.params;
    const userId = req.user?._id;

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({success: false, message: "Order not found"});
    }

    // const phone = formatPhone(order.shippingAddress?.phoneNumber);
    const phone = "+254710000000";
    console.log("Formatted phone:", phone); // should be 254792624342
    if (!phone) {
      return res
        .status(400)
        .json({success: false, message: "Missing phone number in order"});
    }

    const email = order.user?.email || order.shippingAddress?.email;
    if (!email) {
      return res
        .status(400)
        .json({success: false, message: "Missing email address"});
    }

    const amount = order.total;
    const firstName = order.user?.firstName || order.shippingAddress?.firstName;
    const lastName = order.user?.lastName || order.shippingAddress?.lastName;

    const payment = await Payment.create({
      order: order._id,
      user: userId || null,
      transactionId: `PENDING-${Date.now()}`,
      amount,
      msisdn: phone,
      firstName,
      lastName,
      billRefNumber: order._id.toString(),
      status: "pending",
    });

    // Call Paystack
    const response = await paystackRequest("/charge", {
      email,
      amount: amount * 100,
      currency: "KES",
      mobile_money: {phone, provider: "mpesa"}, // use "mpesa" for live keys
      metadata: {
        orderId: order._id.toString(),
        paymentId: payment._id.toString(),
      },
    });

    console.log("🔵 Paystack response:", JSON.stringify(response, null, 2));

    // Check if Paystack returned an error
    if (!response.status) {
      await Payment.findByIdAndUpdate(payment._id, {status: "failed"});
      return res.status(400).json({
        success: false,
        message: response.message || "Payment initiation failed",
      });
    }

    const {reference, status, display_text, gateway_response} = response.data;
    await Payment.findByIdAndUpdate(payment._id, {transactionId: reference});

    // Determine what to tell the frontend
    let frontendMessage =
      display_text ||
      gateway_response ||
      "STK push sent. Complete payment on your phone.";
    if (status === "pending" || status === "processing") {
      frontendMessage =
        "Check your phone for the M‑Pesa prompt. Complete payment to finalize order.";
    } else if (status === "send_pin" || status === "send_otp") {
      frontendMessage =
        "Additional verification required. Follow the prompts on your phone.";
    }

    return res.status(200).json({
      success: true,
      message: frontendMessage,
      data: {
        reference,
        paystackStatus: status,
      },
    });
  } catch (error) {
    console.error("initiatePayment error:", error.message);
    res
      .status(500)
      .json({success: false, message: "Payment initiation failed"});
  }
};

export const acceptPayment = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    console.error("❌ Webhook signature mismatch");
    return res.status(401).send("Unauthorized");
  }

  // Acknowledge immediately
  res.status(200).send("OK");

  const event = req.body;
  if (event.event !== "charge.success") return;

  const {reference, amount, paid_at, customer, metadata} = event.data;
  const phone = customer?.phone?.replace(/^\+/, "");
  const paidAmount = amount / 100;

  try {
    const payment = await Payment.findOneAndUpdate(
      {transactionId: reference},
      {
        status: "completed",
        transactionType: "mobile_money",
        amount: paidAmount,
        msisdn: phone,
        firstName: customer?.first_name,
        lastName: customer?.last_name,
      },
      {new: true},
    );

    if (payment && payment.order) {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: "paid",
        paidAt: new Date(paid_at),
      });
      console.log(`✅ Order ${payment.order} paid via webhook`);
    }
  } catch (err) {
    console.error("Webhook error:", err);
  }
};

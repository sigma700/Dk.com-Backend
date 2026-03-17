import axios from "axios";
import {getAccessToken} from "../../utils/payments.js";
import "dotenv/config";
import {Order} from "../database/models/storeSchema.js";
import {formatPhone} from "../../utils/numberFormater.js";

export const initiatePayments = async (req, res) => {
  try {
    const {orderId} = req.params;
    //Now i want to automatically get the amount from the cart page that already exists
    const order = await Order.findById({
      _id: orderId,
    });

    if (!order) {
      return res.status(404).json({
        sucess: false,
        message: "Order not found !",
      });
    }

    const subTotal = order.total;
    const phoneNumber = formatPhone(order.shippingAddress.phoneNumber);

    const token = await getAccessToken();

    const response = await axios.post(
      `${process.env.DARAJA_BASE_URL}/mpesa/c2b/v1/simulate`,
      {
        ShortCode: process.env.SHORT_CODE,
        CommandID: "CustomerPayBillOnline",
        Amount: subTotal,
        Msisdn: phoneNumber,
        BillRefNumber: "Sigma.com",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Payment simulated:", response.data);
    res.status(200).json({
      success: true,
      message: "Payment successfully initiated!",
      data: response.data,
    });
  } catch (error) {
    console.error("Simulation Failed", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Check console for error details",
    });
  }
};

export const acceptPayment = async (req, res) => {
  const {
    TransID,
    TransactionType,
    TransAmount,
    MSISDN,
    FirstName,
    MiddleName,
    LastName,
    BusinessShortCode,
    BillRefNumber,
    InvoiceNumber,
    OrgAccountBalance,
    TransTime,
    ResultCode,
    ResultDesc,
  } = req.body;

  if (ResultCode !== 0) {
    // Payment failed or was cancelled by customer
    await Order.findByIdAndUpdate(BillRefNumber, {
      paymentStatus: "failed",
    });

    await Payment.create({
      order: BillRefNumber,
      transactionId: TransID || `FAILED-${Date.now()}`,
      amount: TransAmount,
      msisdn: MSISDN,
      status: "failed",
    });

    console.log(
      `❌ Payment failed for order ${BillRefNumber} — Reason: ${ResultDesc}`,
    );
    return res.json({ResultCode: 0, ResultDesc: "Received"});
  }

  await Payment.create({
    order: BillRefNumber,
    transactionId: TransID,
    transactionType: TransactionType,
    amount: TransAmount,
    msisdn: MSISDN,
    firstName: FirstName,
    middleName: MiddleName,
    lastName: LastName,
    businessShortCode: BusinessShortCode,
    billRefNumber: BillRefNumber,
    invoiceNumber: InvoiceNumber,
    orgAccountBalance: OrgAccountBalance,
    transactionTime: TransTime,
    status: "completed",
  });

  await Order.findByIdAndUpdate(BillRefNumber, {
    paymentStatus: "paid",
  });

  console.log(`✅ Order ${BillRefNumber} paid — Transaction: ${TransID}`);
  res.json({ResultCode: 0, ResultDesc: "Confirmed"});
};

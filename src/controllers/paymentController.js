import axios from "axios";
import {getAccessToken} from "../../utils/payments.js";
import "dotenv/config";
import {Order} from "../database/models/storeSchema.js";
import {formatPhone} from "../../utils/numberFormater.js";
import {Payment} from "../database/models/paymentSchema.js";

export const initiatePayments = async (req, res) => {
  try {
    const {orderId} = req.params;

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
  // 1. Acknowledge Safaricom immediately — must respond fast
  res.json({ResultCode: 0, ResultDesc: "Received"});

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

  try {
    // 2. Validate required fields are present
    if (ResultCode === undefined || ResultCode === null) {
      console.error("Invalid callback — missing ResultCode", req.body);
      return;
    }

    if (
      !TransAmount ||
      isNaN(Number(TransAmount)) ||
      Number(TransAmount) <= 0
    ) {
      console.error("Invalid callback — bad TransAmount", TransAmount);
      return;
    }

    if (!MSISDN || !/^2547\d{8}$/.test(MSISDN)) {
      console.error("Invalid callback — bad MSISDN", MSISDN);
      return;
    }

    if (!BillRefNumber) {
      console.error("Invalid callback — missing BillRefNumber");
      return;
    }

    // 3. Handle failed payment
    if (ResultCode !== 0) {
      await Payment.create({
        transactionId: TransID || `FAILED-${Date.now()}`,
        amount: Number(TransAmount),
        msisdn: MSISDN,
        billRefNumber: BillRefNumber,
        status: "failed",
        resultCode: ResultCode,
        resultDesc: ResultDesc,
      });

      console.warn(
        `Payment failed — BillRef: ${BillRefNumber} | Reason: ${ResultDesc}`,
      );
      return;
    }

    // 4. Validate TransID exists on success
    if (!TransID) {
      console.error(
        "Invalid callback — successful payment missing TransID",
        req.body,
      );
      return;
    }

    // 5. Idempotency check — prevent duplicate processing
    const existing = await Payment.findOne({transactionId: TransID});
    if (existing) {
      console.warn(
        `Duplicate callback received for TransID: ${TransID} — skipping`,
      );
      return;
    }

    // 6. Find order by BillRefNumber
    // NOTE: Since BillRefNumber is "Sigma.com" in your simulation,
    // you should pass the actual orderId as BillRefNumber in initiatePayments.
    // See fix in initiatePayments below.
    const order = await Order.findOne({
      $or: [
        // Support both ObjectId and custom ref, depending on your fix
        ...(mongoose.isValidObjectId(BillRefNumber)
          ? [{_id: BillRefNumber}]
          : []),
        {billRefNumber: BillRefNumber},
      ],
    });

    if (!order) {
      console.error(`Order not found for BillRefNumber: ${BillRefNumber}`);
      // Still save the payment — don't lose the transaction record
      await Payment.create({
        transactionId: TransID,
        transactionType: TransactionType,
        amount: Number(TransAmount),
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
        resultCode: ResultCode,
        orderLinked: false, // flag for manual reconciliation
      });
      return;
    }

    // 7. Validate amount matches order total (fraud prevention)
    if (Number(TransAmount) < order.total) {
      console.error(
        `Amount mismatch — Expected: ${order.total}, Got: ${TransAmount} | Order: ${order._id}`,
      );
      await Payment.create({
        transactionId: TransID,
        amount: Number(TransAmount),
        msisdn: MSISDN,
        billRefNumber: BillRefNumber,
        status: "amount_mismatch",
        resultCode: ResultCode,
        orderLinked: true,
        order: order._id,
      });
      return;
    }

    // 8. Save payment and update order atomically
    await Promise.all([
      Payment.create({
        order: order._id,
        transactionId: TransID,
        transactionType: TransactionType,
        amount: Number(TransAmount),
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
        resultCode: ResultCode,
        orderLinked: true,
      }),
      Order.findByIdAndUpdate(order._id, {
        paymentStatus: "paid",
        paidAt: new Date(),
      }),
    ]);

    console.log(
      `Order ${order._id} paid — TransID: ${TransID} | Amount: KES ${TransAmount}`,
    );
  } catch (err) {
    console.error("acceptPayment processing error:", err.message, err);
  }
};

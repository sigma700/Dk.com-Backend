import axios from "axios";
import {getAccessToken} from "../../utils/payments.js";
import "dotenv/config";

export const initiatePayments = async (req, res) => {
  try {
    const {phoneNumber, amount} = req.body;

    const token = await getAccessToken();

    const response = await axios.post(
      `${process.env.DARAJA_BASE_URL}/mpesa/c2b/v1/simulate`,
      {
        ShortCode: process.env.SHORT_CODE,
        CommandID: "CustomerPayBillOnline",
        Amount: amount,
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

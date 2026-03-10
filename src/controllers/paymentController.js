//LOGIC FOR MAKING THE PAYMENTS WORK

import axios from "axios";
import {getAccessToken} from "../../utils/payments.js";

//STEP2 REGISTER C2B URLS
export const initiatePayments = async (req, res) => {
  try {
    const {phoneNumber, amount, billRefNumber} = req.body;

    const token = await getAccessToken();

    const response = await axios.post(
      `${process.env.DARAJA_BASE_URL}`,
      {
        ShortCode: process.env.SHORTCODE,
        CommandID: "CustomerPayBillOnline",
        Amount: amount,
        Msisdn: phoneNumber,
        billRefNumber: billRefNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "appliaction/json",
        },
      },
    );

    console.log("Paymet simulated : ", response.data);
    res.status(200).json({
      sucess: true,
      message: "Payment has been sucessfully initiated as wanted",
      data: response.data,
    });
  } catch (error) {
    console.error("Simulation Failed", error.response?.data || error.message);
    res.status(500).json({
      sucess: false,
      message: "Check the console for more info about the error message !",
    });
  }
};

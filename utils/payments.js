//algo for making payments using the daraja API
import "dotenv/config";
import {response} from "express";

//STEP 1 GEGT ACCESS TOKEN
export const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`,
  ).toString("base64");

  const respose = await fetch(`${process.env.DARAJA_BASE_URL}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  console.log(respose.data.access_token);

  return response.data.access_token;
};

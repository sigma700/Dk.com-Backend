//Here i want to have the order details for future refernce
import {Schema, model} from "mongoose";

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    transactionType: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    msisdn: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
    },

    businessShortCode: {
      type: String,
    },

    billRefNumber: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  {timestamps: true}, // createdAt and updatedAt
);

export const Payment = model("Payment", paymentSchema);

import mongoose, {Schema} from "mongoose";

const paymentSchema = new Schema(
  {
    order: {type: Schema.Types.ObjectId, ref: "Order", required: true},
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    transactionId: {type: String, required: true},
    amount: {type: Number, required: true},
    msisdn: {type: String, required: true},
    firstName: String,
    lastName: String,
    billRefNumber: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionType: String,
  },
  {timestamps: true},
);

export const Payment = mongoose.model("Payment", paymentSchema);

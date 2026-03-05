import mongoose, {Model} from "mongoose";
import {Schema} from "mongoose";

const userSchema = new Schema(
  {
    email: {type: String, required: true},
    verificationToken: {type: String},
    password: {type: String, required: true},
    firstName: String,
    lastName: String,
    isVerified: {type: String, default: false},
    orders: {type: Array, ref: "Order"},
  },
  {
    timeStamps: true,
  },
);

export const User = mongoose.model("User", userSchema);

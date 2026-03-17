import {Schema} from "mongoose";
import mongoose from "mongoose";

const productSchema = new Schema(
  {
    name: {type: String, required: true},
    description: {
      details: String,
      shippingInfo: String,
    },
    price: {type: Number, required: true, min: 0},
    stock: {type: Number, required: true, min: 0, default: 0},
    category: {
      type: String,
      required: true,
      enum: ["Consumable", "Electronic", "Bathroom"],
    },
    image: {
      data: {type: Buffer, required: true}, // the binary
      contentType: {type: String, required: true}, // e.g.,
    },
  },
  {timestamps: true},
);

export const Product = mongoose.model("Product", productSchema);

//cart items schema

const cartItemSchema = new Schema(
  {
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, required: true, min: 1},
    priceAtAdd: {type: Number, required: true, min: 0},
  },
  // {_id: false},
);

//burried in between the cart schema
const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    sessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "converted", "abandoned"],
      default: "active",
    },
    items: [cartItemSchema],
  },
  {timestamps: true},
);

export const Cart = mongoose.model("Cart", cartSchema);

const orderItemSchema = new Schema({
  product: {type: Schema.Types.ObjectId, ref: "Product"},
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const orderSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    items: [orderItemSchema],
    subtotal: Number,
    shippingFee: Number,
    total: Number,
    shippingAddress: {
      email: String,
      firstName: String,
      lastName: String,
      subCounty: String,
      ward: String,
      streetAddress: String,
      phoneNumber: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH ON DELIVERY", "MobilePay"],
    },
  },
  {timestamps: true},
);

export const Order = mongoose.model("Order", orderSchema);

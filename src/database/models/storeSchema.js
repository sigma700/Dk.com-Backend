import {Schema} from "mongoose";
import mongoose from "mongoose";

const productSchema = new Schema(
  {
    name: {type: String, required: true},
    description: String,
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

const orderItemSchema = new Schema(
  {
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, required: true},
    priceAtPurchase: {type: Number, required: true}, // snapshot for historical accuracy
  },
  {_id: false},
);

//order schema with also some embedded items
const orderSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    cart: {type: Schema.Types.ObjectId, ref: "Cart"},
    items: [orderItemSchema],
    totalAmount: {type: Number, required: true, min: 0},
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentDetails: Schema.Types.Mixed,
  },
  {timestamps: true},
);

export const Order = mongoose.model("Order", orderSchema);

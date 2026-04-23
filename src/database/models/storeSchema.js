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
cartSchema.index({user: 1, sessionId: 1, status: 1});

export const Cart = mongoose.model("Cart", cartSchema);

const orderItemSchema = new Schema({
  product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
  name: {type: String, required: true},
  price: {type: Number, required: true, min: 0},
  quantity: {type: Number, required: true, min: 1},
  image: {type: String},
});

const shippingAddressSchema = new Schema({
  firstName: {type: String, required: true, trim: true},
  lastName: {type: String, required: true, trim: true},
  email: {type: String, required: true, lowercase: true, trim: true},
  phoneNumber: {type: String, required: true, trim: true},

  county: {type: String, required: true, trim: true},
  subCounty: {type: String, required: true, trim: true}, // e.g., "Westlands"
  ward: {type: String, required: true, trim: true}, // e.g., "Kitisuru"
  estateOrArea: {type: String, trim: true, default: ""}, // optional
  streetAddress: {type: String, required: true, trim: true}, // door, building, street

  // Postal code (Kenya uses 5‑digit codes, e.g., 00100)
  postalCode: {type: String, trim: true, default: ""},

  // For future scaling (international)
  country: {type: String, required: true, default: "KE", uppercase: true},

  // Helps the courier
  deliveryInstructions: {type: String, trim: true, maxlength: 250},
});

const orderSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: "User", required: false},
    items: [orderItemSchema],

    // Financial breakdown
    subtotal: {type: Number, required: true, min: 0},
    shippingFee: {type: Number, required: true, min: 0},
    total: {type: Number, required: true, min: 0},

    // Shipping information (now a proper sub‑document)
    shippingAddress: {type: shippingAddressSchema, required: true},

    // Billing address – optional, only if different from shipping
    billingSameAsShipping: {type: Boolean, default: true},
    billingAddress: {type: shippingAddressSchema},

    // Shipping method & tracking
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "same-day"],
      default: "standard",
    },
    trackingNumber: {type: String, trim: true, default: ""},
    estimatedDeliveryDate: Date,

    // Payment
    paymentMethod: {
      type: String,
      enum: ["CASH ON DELIVERY", "MobilePay", "CARD", "MPESA"],
      default: "CASH ON DELIVERY",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDetails: {
      mpesaReceiptNumber: String,
      transactionDate: Date,
      mobilePayNumber: String,
    },

    // Order lifecycle (expanded for Kenyan courier stages)
    orderStatus: {
      type: String,
      enum: [
        "processing",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "processing",
    },
  },
  {timestamps: true},
);

export const Order = mongoose.model("Order", orderSchema);

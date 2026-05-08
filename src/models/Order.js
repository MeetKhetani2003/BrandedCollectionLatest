import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: "India",
    },
    phone: String,
  },
  { _id: false },
);
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    customerName: {
      type: String,
      trim: true,
    },
    awbNumber: {
      type: String,
      trim: true,
    },

    courier: {
      type: String,
      default: "shree-tirupati",
    },

    tracking: {
      status: String, // CurStatus
      lastFetchedAt: Date,
      raw: mongoose.Schema.Types.Mixed, // full API response
    },
    deliveryAddress: addressSchema,
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        productName: String, // 🔥 manual name
        price: Number, // 🔥 override price
        qty: Number,
        size: String,
      },
    ],

    amount: { type: Number, required: true },
    paymentId: String,
    status: { type: String, default: "paid" },
    orderStatus: { type: String, default: "orderPlaced" },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

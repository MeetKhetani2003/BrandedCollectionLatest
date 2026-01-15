import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // ONLINE USER (optional)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // OFFLINE CUSTOMER
    customerName: {
      type: String,
      trim: true,
    },
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
          required: false, // 🔥 manual items allowed
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
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);

import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["flat", "percent"], // ₹100 OFF or 10% OFF
      required: true,
    },

    value: {
      type: Number,
      required: true, // ₹ amount OR % value
    },

    minOrderValue: {
      type: Number,
      default: 0,
    },

    maxDiscount: {
      type: Number, // only for percent coupons
      default: null,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    usageLimit: {
      type: Number,
      default: null, // unlimited if null
    },

    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

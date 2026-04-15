import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * OrderReservation Schema
 * Tracks stock reservations during payment processing
 * Prevents race conditions when multiple users try to buy same item
 */
const OrderReservationSchema = new Schema(
  {
    // User who reserved
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Items reserved (same structure as Order)
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: String,
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        size: { type: String, required: true },
      },
    ],

    // Payment details
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },

    // Reservation status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending",
    },

    // Expiry time (15 minutes from creation)
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index for auto-deletion
    },

    // Shipping address
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for fast queries
OrderReservationSchema.index({ status: 1, expiresAt: 1 });
OrderReservationSchema.index({ user: 1, status: 1 });

export default
  mongoose.models.OrderReservation ||
  mongoose.model("OrderReservation", OrderReservationSchema);

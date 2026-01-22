import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    reason: {
      type: String,
    },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);

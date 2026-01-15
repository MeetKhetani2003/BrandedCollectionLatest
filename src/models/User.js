import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const CartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    selectedSize: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  postalCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "India",
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
      minlength: 6,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      required: function () {
        return this.provider === "google";
      },
      sparse: true,
    },
    orderHistory: [{ order: { type: Schema.Types.ObjectId, ref: "Order" } }],
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profilePicture: String,
    /** 🏠 MULTIPLE ADDRESSES SUPPORTED HERE */
    addresses: [addressSchema],

    /** ⭐ OPTIONAL DEFAULT SELECTED ADDRESS INDEX */
    defaultAddress: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cart: [CartItemSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (this.provider !== "local" || !this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPasswordHash
) {
  return await bcrypt.compare(candidatePassword, userPasswordHash);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDb();
    const { token, password } = await req.json();

    // 1. Hash the token from the URL to match the one stored in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Find user with valid token and check if it's not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token is invalid or has expired" },
        { status: 400 },
      );
    }

    // 3. Update password and clear reset fields
    // Your schema's 'pre-save' hook will automatically hash this password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

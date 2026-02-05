import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/utils/sendMail";

export async function POST(req) {
  try {
    await connectDb();
    const { email } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, don't reveal if a user doesn't exist.
      // Just say "If an account exists, an email was sent."
      return NextResponse.json({ message: "Reset link sent if email exists." });
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash it and set expiry (e.g., 1 hour)
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // 3. Send the email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

    const htmlContent = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request - BrandedCollection",
      html: htmlContent,
    });

    return NextResponse.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt, { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDb();
    const body = await req.json();

    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;
    const googleId = body?.googleId;

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 },
      );
    }

    // 🔐 TRUST DB, NOT CLIENT
    const provider = user.provider || "local";

    /* ================= LOCAL LOGIN ================= */
    if (provider === "local") {
      if (!password) {
        return NextResponse.json(
          { message: "Password required" },
          { status: 400 },
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { message: "Password not set for this account" },
          { status: 400 },
        );
      }

      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid password" },
          { status: 401 },
        );
      }

      return createSession(user);
    }

    /* ================= GOOGLE LOGIN ================= */
    if (provider === "google") {
      if (!googleId || user.googleId !== googleId) {
        return NextResponse.json(
          { message: "This account uses Google login" },
          { status: 403 },
        );
      }

      return createSession(user);
    }

    /* ================= UNKNOWN ================= */
    return NextResponse.json(
      { message: "Unsupported auth provider" },
      { status: 400 },
    );
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ================= SESSION CREATOR ================= */
function createSession(user) {
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET || "MyDevelopement",
    { expiresIn: "7d" },
  );

  const response = NextResponse.json({
    message: "Login successful",
    user: {
      id: user._id,
      email: user.email,
    },
  });

  response.cookies.set("auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

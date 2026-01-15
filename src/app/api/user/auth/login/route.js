import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDb();
    const body = await req.json();

    const email = body?.email?.trim();
    const password = body?.password;
    const googleId = body?.googleId;
    const provider = body?.provider || "local";

    if (!email)
      return NextResponse.json({ message: "Email required" }, { status: 400 });

    const user = await User.findOne({ email });

    // ---------------- If user doesn't exist ----------------
    if (!user) {
      return NextResponse.json(
        { message: "Account not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Google login but account is password login
    if (provider === "google" && user.password) {
      return NextResponse.json(
        {
          message:
            "This account uses a password. Login using email & password.",
        },
        { status: 403 }
      );
    }

    // Normal login but user is Google-only
    if (provider === "local" && !user.password) {
      return NextResponse.json(
        {
          message:
            "This account was created using Google login. Continue with Google.",
        },
        { status: 403 }
      );
    }

    // Validate password (local login)
    if (provider === "local") {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return NextResponse.json(
          { message: "Wrong password" },
          { status: 401 }
        );
      return createSession(user);
    }

    // Google login
    if (provider === "google" && user.googleId === googleId) {
      return createSession(user);
    }

    return NextResponse.json(
      { message: "Invalid login attempt" },
      { status: 400 }
    );
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

function createSession(user) {
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const response = NextResponse.json({
    message: "Login successful",
    user: { id: user._id, email: user.email, provider: user.provider },
  });

  response.cookies.set("auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
    path: "/",
  });

  return response;
}

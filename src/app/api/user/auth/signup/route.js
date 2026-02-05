import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
async function generateUsernameFromEmail(email) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, ""); // safe chars

  let username = base;
  let counter = 1;

  while (await User.exists({ username })) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
}

export async function POST(req) {
  try {
    await connectDb();
    const data = await req.json();
    console.log(data);

    if (!data.email) {
      return NextResponse.json(
        { message: "Email is required for signup." },
        { status: 400 },
      );
    }

    const provider = data.provider || "local";

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return NextResponse.json(
        {
          message: `This email is already registered via ${existingUser.provider}. Please log in.`,
        },
        { status: 409 },
      );
    }

    if (provider === "local") {
      if (!data.password) {
        return NextResponse.json(
          { message: "Password is required for local signup." },
          { status: 400 },
        );
      }
      delete data.googleId;
    } else if (provider === "google") {
      if (!data.googleId) {
        return NextResponse.json(
          { message: "Google ID is required for Google signup." },
          { status: 400 },
        );
      }
      delete data.password;
    }

    const username =
      data.username ||
      (provider === "google"
        ? await generateUsernameFromEmail(data.email)
        : undefined);

    const newUser = await User.create({
      email: data.email,
      provider,
      googleId: provider === "google" ? data.googleId : undefined,
      password: provider === "local" ? data.password : undefined,
      username,
      number: data.number || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
    });

    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      number: newUser.number,
      lastName: newUser.lastName,
      provider: newUser.provider,
    };
    return NextResponse.json(
      { user: userResponse, message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: error.message, details: error.errors },
        { status: 400 },
      );
    }

    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error during signup." },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDb();
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error in getting users:", error);
    return NextResponse.json(
      { message: "Error fetching user data." },
      { status: 500 },
    );
  }
}

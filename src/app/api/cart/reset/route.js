import { NextResponse } from "next/server";
import { connectDb } from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function POST() {
  try {
    await connectDb();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwtDecode(token);

    await User.findByIdAndUpdate(decoded.userId, {
      $set: { cart: [] },
    });

    return NextResponse.json({ status: "cleared" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

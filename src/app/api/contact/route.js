import { connectDb } from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDb();

  const body = await req.json();
  const { name, email, phone, reason, message } = body;

  if (!name || !email || !phone || !reason || !message) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  await Contact.create({
    name,
    email,
    phone,
    reason,
    message,
  });

  return NextResponse.json({ success: true });
}

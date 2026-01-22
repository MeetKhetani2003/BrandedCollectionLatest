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

export async function GET() {
  try {
    // 1. Establish connection to MongoDB
    await connectDb();

    // 2. Fetch all messages from the "ContactMessage" collection
    // We sort by 'createdAt' in descending order (-1) to see newest first
    const messages = await Contact.find({}).sort({ createdAt: -1 });

    // 3. Return the data with a 200 OK status
    return NextResponse.json(
      {
        success: true,
        count: messages.length,
        data: messages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET_CONTACT_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "FAILED_TO_FETCH_MESSAGES" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } }
  );

  // 🔥 MUST MATCH login cookie options EXACTLY
  response.cookies.set("auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // SAME AS LOGIN
    path: "/", // SAME AS LOGIN
    expires: new Date(0),
  });

  return response;
}

import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin-auth";
const COOKIE_PATH = "/";

function adminCredentialsValid(username, password) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) return false;
  return username === adminUser && password === adminPass;
}

async function createAdminCookieValue() {
  const adminUser = process.env.ADMIN_USERNAME || "";
  const adminPass = process.env.ADMIN_PASSWORD || "";
  const value = `${adminUser}:${adminPass}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    if (!adminCredentialsValid(username, password)) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 },
      );
    }

    const cookieValue = await createAdminCookieValue();
    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: COOKIE_PATH,
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to sign in. Please try again." },
      { status: 500 },
    );
  }
}

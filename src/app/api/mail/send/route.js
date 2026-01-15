import { sendMail } from "@/utils/sendMail";

export async function POST(req) {
  try {
    const payload = await req.json();
    const response = await sendMail(payload);

    return Response.json(response);
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

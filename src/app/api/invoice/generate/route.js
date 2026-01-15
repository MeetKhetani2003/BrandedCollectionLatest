import { generateInvoice } from "@/utils/generateInvoice";

export async function POST(req) {
  const { order } = await req.json();

  const pdfBuffer = await generateInvoice(order);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}

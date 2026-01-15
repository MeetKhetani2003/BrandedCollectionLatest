import Order from "@/models/Order";
import { generateInvoice } from "@/utils/generateInvoice";
import { sendMail } from "@/utils/sendMail";

export async function POST(req) {
  const { orderData, user } = await req.json();

  const order = await Order.create(orderData);

  const pdf = await generateInvoice(order);

  await sendMail({
    to: user.email,
    subject: `Order Confirmed - #${order._id}`,
    html: `<h2>Thank you for shopping at BrandedCollection!</h2>`,
    attachments: [{ filename: `invoice-${order._id}.pdf`, content: pdf }],
  });

  return Response.json({ success: true, order });
}

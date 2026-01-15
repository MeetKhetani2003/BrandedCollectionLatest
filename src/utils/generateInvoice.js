import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateInvoice(order) {
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  let y = height - 50;

  // === BRAND HEADER BOX ===
  page.drawRectangle({
    x: 0,
    y: y - 40,
    width,
    height: 45,
    color: rgb(0.3, 0.22, 0.15), // Premium Brown
  });

  page.drawText("BrandedCollection", {
    x: 50,
    y: y - 18,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= 80;

  // === ORDER DETAILS TITLE ===
  page.drawText("Order Summary", {
    x: 50,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 25;

  // === BASIC DETAILS ===
  const details = [
    `Order ID: ${order._id}`,
    `Payment ID: ${order.paymentId}`,
    `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
    `Total Amount Paid: Rs. ${order.amount}`,
  ];

  details.forEach((line) => {
    page.drawText(line, { x: 50, y, size: 11, font: fontRegular });
    y -= 16;
  });

  y -= 20;

  // === ITEM TABLE HEADER ===
  page.drawText("Purchased Items", {
    x: 50,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 15;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.75),
  });

  y -= 20;

  // === TABLE COLUMN TITLES ===
  const headers = ["#", "Product", "Size", "Qty", "Price"];
  const positions = [50, 90, 260, 310, 380];

  headers.forEach((h, i) => {
    page.drawText(h, {
      x: positions[i],
      y,
      size: 11,
      font: fontBold,
    });
  });

  y -= 12;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.7,
    color: rgb(0.75, 0.75, 0.75),
  });

  y -= 20;

  // === TABLE ROWS ===
  order.items.forEach((item, i) => {
    const product = item.product || {};
    const name = product.name || item.productName || "Product";
    const size = item.size || "-";
    const price = product?.price?.current || item.price || 0;
    const qty = item.qty;

    const values = [i + 1, name.slice(0, 30), size, qty, `Rs. ${price}`];

    values.forEach((v, idx) => {
      page.drawText(String(v), {
        x: positions[idx],
        y,
        size: 10,
        font: fontRegular,
      });
    });

    y -= 18;
  });

  y -= 25;

  // === TOTAL PRICE BAR ===
  page.drawRectangle({
    x: 0,
    y: y - 35,
    width,
    height: 45,
    color: rgb(0.95, 0.9, 0.85),
  });

  page.drawText(`Grand Total: Rs. ${order.amount}`, {
    x: 50,
    y: y - 15,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 60;

  // === FOOTER ===
  page.drawText("Thank you for shopping with BrandedCollection.", {
    x: 50,
    y,
    size: 12,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText("For support: support@brandedcollection.com", {
    x: 50,
    y: y - 15,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  return await pdfDoc.save();
}

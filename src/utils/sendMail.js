import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html, attachments }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log(to, subject, html, attachments);

  return transporter.sendMail({
    from: `"BrandedCollection" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}

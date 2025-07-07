import emailjs from "@emailjs/browser";

export async function sendConfirmationEmail({
  to_email,
  to_name,
  qrcode_url,
}: {
  to_email: string;
  to_name: string;
  qrcode_url: string;
}) {
  const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  const TEMPLATE_ID = qrcode_url
    ? process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_QR
    : process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_NO_QR;


    // console.log("Kirim to_email:", to_email);
    // console.log("Nama to_name", to_name);
    // console.log("QR URL qrcode_url", qrcode_url);

  const payload = {
    to_email,
    to_name,
    qrcode_url,
  };

  return await emailjs.send(SERVICE_ID!, TEMPLATE_ID!, payload, PUBLIC_KEY!);
}

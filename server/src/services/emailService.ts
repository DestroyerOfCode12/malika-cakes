import nodemailer, { Transporter } from 'nodemailer';

// When SMTP_HOST is unset (local dev), emails are logged to the console
// instead of sent, so the order flow works without any mail credentials.
let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const FROM = () =>
  `"${process.env.EMAIL_FROM_NAME || "Malika's Cake Boutique"}" <${process.env.EMAIL_FROM || 'orders@malikacakes.co.za'}>`;

const formatZAR = (amount: number) => `R${amount.toFixed(2)}`;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

// Shared branded HTML wrapper (pink #DB2777 + charcoal #3F3F46, matching the site)
const wrap = (title: string, body: string) => `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#FFF8FA;font-family:Poppins,Arial,sans-serif;color:#3F3F46;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#3F3F46;border-radius:16px 16px 0 0;padding:20px;text-align:center;">
      <span style="color:#DB2777;font-size:26px;font-weight:bold;">🧁 Malika's Cake Boutique</span>
    </div>
    <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px;">
      <h1 style="color:#3F3F46;font-size:20px;margin-top:0;">${title}</h1>
      ${body}
      <hr style="border:none;border-top:1px solid #FDF2F8;margin:24px 0;" />
      <p style="font-size:12px;color:#9ca3af;">
        Malika's Cake Boutique · Midrand, Johannesburg<br/>
        Questions? Just reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:6px 0;color:#9ca3af;">${label}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${value}</td></tr>`;

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  sizeName: string;
  flavorName: string;
  fillingName: string;
  topperNames: string[];
  specialRequests?: string | null;
  allergies?: string | null;
  totalPrice: number;
  pickupDate: Date;
  pickupTime: string;
  paymentDueDate: Date;
}

const send = async (to: string, subject: string, html: string): Promise<void> => {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] (SMTP not configured — logging instead)\n  To: ${to}\n  Subject: ${subject}`);
    return;
  }
  try {
    await t.sendMail({ from: FROM(), to, subject, html });
    console.log(`[email] Sent "${subject}" to ${to}`);
  } catch (err) {
    // Never fail the request because email failed — log and move on.
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
};

export const emailService = {
  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    const toppers = data.topperNames.length > 0 ? data.topperNames.join(', ') : 'None';
    const body = `
      <p>Hi ${data.customerName},</p>
      <p>Your custom cake order has been placed! Here's what we're making for you:</p>
      <table style="width:100%;border-collapse:collapse;background:#FDF2F8;border-radius:12px;padding:12px;">
        ${row('Order #', data.orderNumber)}
        ${row('Size', data.sizeName)}
        ${row('Flavor', data.flavorName)}
        ${row('Filling', data.fillingName)}
        ${row('Toppers', toppers)}
        ${data.allergies ? row('Allergies', data.allergies) : ''}
        ${data.specialRequests ? row('Special Requests', data.specialRequests) : ''}
      </table>
      <p style="font-size:22px;color:#DB2777;font-weight:bold;text-align:center;margin:20px 0;">
        Total: ${formatZAR(data.totalPrice)} <span style="font-size:13px;color:#9ca3af;">(incl. 15% VAT)</span>
      </p>
      <p>📅 <strong>Pickup:</strong> ${formatDate(data.pickupDate)} at ${data.pickupTime}</p>
      <p>⏰ <strong>Payment due:</strong> ${formatDate(data.paymentDueDate)}</p>
      <p>👉 <strong>Next step:</strong> reply to this email or WhatsApp us to arrange payment.</p>
      <p>Warm regards,<br/>Malika's Cake Boutique 🧁</p>`;
    await send(data.customerEmail, 'Your Cake Order is Confirmed! ✨', wrap('Order Confirmed!', body));
  },

  async sendPaymentReminder(data: OrderEmailData): Promise<void> {
    const body = `
      <p>Hi ${data.customerName},</p>
      <p>Just a friendly reminder: payment for your cake order (<strong>${data.orderNumber}</strong>) is due soon!</p>
      <p style="font-size:22px;color:#DB2777;font-weight:bold;text-align:center;margin:20px 0;">
        Amount due: ${formatZAR(data.totalPrice)}
      </p>
      <p>⏰ <strong>Due:</strong> ${formatDate(data.paymentDueDate)}</p>
      <p>Pay now to secure your cake — see you on ${formatDate(data.pickupDate)}! 🎉</p>
      <p>– Malika's Cake Boutique</p>`;
    await send(data.customerEmail, 'Payment Reminder: Your Cake Order Due Soon 🧁', wrap('Payment Reminder', body));
  },

  async sendReadyNotification(data: OrderEmailData): Promise<void> {
    const body = `
      <p>Hi ${data.customerName},</p>
      <p>Exciting news — your custom cake is <strong>ready for pickup</strong>! 🎂</p>
      <table style="width:100%;border-collapse:collapse;background:#FDF2F8;border-radius:12px;">
        ${row('Order #', data.orderNumber)}
        ${row('Pickup Date', formatDate(data.pickupDate))}
        ${row('Pickup Time', data.pickupTime)}
        ${row('Your Cake', `${data.sizeName} ${data.flavorName} with ${data.fillingName}`)}
      </table>
      <p style="margin-top:16px;">📍 Location: Midrand, Johannesburg</p>
      <p>See you soon!<br/>– Malika's Cake Boutique 🧁</p>`;
    await send(data.customerEmail, 'Your Cake is Ready! 🎂', wrap('Ready for Pickup!', body));
  },
};

export type { OrderEmailData };

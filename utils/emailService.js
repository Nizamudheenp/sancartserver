const { Resend } = require('resend');
const {
  adminOrderTemplate,
  adminReturnTemplate,
  customerOrderReceiptTemplate,
  customerOrderStatusTemplate,
  customerReturnDecisionTemplate,
  contactMessageTemplate,
} = require('../templates/email');

const RESENDAPIKEY = process.env.RESEND_API_KEY;
const MAILFROM = process.env.MAIL_FROM;
const MAILTO = process.env.MAIL_TO;

const getResendClient = () => {
  if (!RESENDAPIKEY) {
    return null;
  }
  return new Resend(RESENDAPIKEY);
};


const sendMailSafe = async ({ to, subject, html, replyTo }) => {
  try {
    if (!RESENDAPIKEY) {
      console.error('[EmailService] ❌ Missing environment variable: RESEND_API_KEY');
      return;
    }
    if (!to) {
      console.error('[EmailService] ❌ Missing recipient "to" address');
      return;
    }

    const resend = getResendClient();
    if (!resend) {
      console.error('[EmailService] ❌ Resend client failed to initialize');
      return;
    }

    if (!MAILFROM) {
      console.error('[EmailService] ❌ Missing environment variable: MAIL_FROM');
      return;
    }

    console.log(`[EmailService] 📤 Sending email to: "${to}" (Subject: "${subject}")...`);
    const { data, error } = await resend.emails.send({
      from: MAILFROM,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    if (error) {
      console.error(`[EmailService] ❌ Resend API error:`, error.message);
      return;
    }

    console.log(`[EmailService] ✅ Email delivered via Resend! ID: ${data?.id}`);
  } catch (err) {
    console.error(`[EmailService] ❌ Failed to send email to ${to}:`, err.message);
  }
};

/**
 * 1. Admin Alert: New Order Placed
 */
exports.sendAdminNewOrderEmail = async (order) => {
  if (!MAILTO) return;
  const subject = `[New Order] #${order.orderId || order._id} - ₹${order.totalAmount}`;
  const html = adminOrderTemplate(order);
  await sendMailSafe({ to: MAILTO, subject, html });
};

/**
 * 2. Admin Alert: New Return Request
 */
exports.sendAdminNewReturnEmail = async (returnReq) => {
  if (!MAILTO) return;
  const orderId = returnReq.orderId?.orderId || returnReq.orderId || returnReq._id;
  const subject = `[Return Request] For Order #${orderId}`;
  const html = adminReturnTemplate(returnReq);
  await sendMailSafe({ to: MAILTO, subject, html });
};

/**
 * 3. Customer Receipt: Order Confirmation
 */
exports.sendCustomerOrderReceipt = async (order, targetEmail) => {
  if (!targetEmail) return;
  const subject = `Order Confirmation #${order.orderId || order._id} - Sancart`;
  const html = customerOrderReceiptTemplate(order);
  await sendMailSafe({ to: targetEmail, subject, html });
};

/**
 * 4. Customer Alert: Order Status Update (Shipped / Delivered / Cancelled)
 */
exports.sendCustomerOrderStatusEmail = async (order, targetEmail, status) => {
  if (!targetEmail) return;
  const subject = `Order Update #${order.orderId || order._id}: ${status.toUpperCase()} - Sancart`;
  const html = customerOrderStatusTemplate(order, status);
  await sendMailSafe({ to: targetEmail, subject, html });
};

/**
 * 5. Customer Alert: Return Decision (Approved / Rejected)
 */
exports.sendCustomerReturnDecisionEmail = async (returnReq, targetEmail, status) => {
  if (!targetEmail) return;
  const subject = `Return Request ${status.toUpperCase()} - Sancart`;
  const html = customerReturnDecisionTemplate(returnReq, status);
  await sendMailSafe({ to: targetEmail, subject, html });
};

/**
 * 6. Contact Form Inquiry
 */
exports.sendContactFormEmail = async ({ name, email, message }) => {
  if (!MAILTO) {
    console.error('[EmailService] ❌ Cannot send contact form: MAIL_TO is not defined in environment variables!');
    return;
  }
  const subject = `New Contact Form Submission from ${name}`;
  const html = contactMessageTemplate({ name, email, message });
  await sendMailSafe({
    to: MAILTO,
    subject,
    html,
    replyTo: email,
  });
};

const nodemailer = require('nodemailer');
const {
  adminOrderTemplate,
  adminReturnTemplate,
  customerOrderReceiptTemplate,
  customerOrderStatusTemplate,
  customerReturnDecisionTemplate,
  contactMessageTemplate,
} = require('../templates/email');

let transporterInstance = null;

const getTransporter = () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('Email warning: MAIL_USER or MAIL_PASS environment variables are not set.');
    return null;
  }

  if (!transporterInstance) {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  return transporterInstance;
};

/**
 * Generic email dispatcher with error isolation
 */
const sendMailSafe = async ({ to, subject, html, replyTo }) => {
  try {
    const transporter = getTransporter();
    if (!transporter || !to) return;

    await transporter.sendMail({
      from: `"Sancart Store" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
  }
};

/**
 * 1. Admin Alert: New Order Placed
 */
exports.sendAdminNewOrderEmail = async (order) => {
  if (!process.env.MAIL_TO) return;
  const subject = `[New Order] #${order.orderId || order._id} - ₹${order.totalAmount}`;
  const html = adminOrderTemplate(order);
  await sendMailSafe({ to: process.env.MAIL_TO, subject, html });
};

/**
 * 2. Admin Alert: New Return Request
 */
exports.sendAdminNewReturnEmail = async (returnReq) => {
  if (!process.env.MAIL_TO) return;
  const orderId = returnReq.orderId?.orderId || returnReq.orderId || returnReq._id;
  const subject = `[Return Request] For Order #${orderId}`;
  const html = adminReturnTemplate(returnReq);
  await sendMailSafe({ to: process.env.MAIL_TO, subject, html });
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
  if (!process.env.MAIL_TO) return;
  const subject = `New Contact Form Submission from ${name}`;
  const html = contactMessageTemplate({ name, email, message });
  await sendMailSafe({
    to: process.env.MAIL_TO,
    subject,
    html,
    replyTo: email,
  });
};

const baseEmailLayout = require('./baseEmailLayout');

const customerOrderStatusTemplate = (order, status) => {
  const isShipped = status === 'shipped';
  const isDelivered = status === 'delivered';
  const headerColor = isDelivered ? '#10b981' : isShipped ? '#2563eb' : '#64748b';
  const statusTitle = isShipped
    ? '📦 Your Order Has Been Shipped!'
    : isDelivered
    ? '✅ Your Order Has Been Delivered!'
    : `Order Status: ${status.toUpperCase()}`;

  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/myorders`;

  const content = `
    <p style="font-size: 15px; margin: 0 0 16px;">
      Great news! The status of your order <strong>#${order.orderId || order._id}</strong> has been updated.
    </p>

    <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 20px;">
      <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px;">
        <tr>
          <td style="color: #64748b; width: 140px;"><strong>Order ID:</strong></td>
          <td style="color: #0f172a; font-weight: 600;">#${order.orderId || order._id}</td>
        </tr>
        <tr>
          <td style="color: #64748b;"><strong>Current Status:</strong></td>
          <td style="color: ${headerColor}; font-weight: 700; text-transform: uppercase;">
            ${status}
          </td>
        </tr>
        <tr>
          <td style="color: #64748b; vertical-align: top;"><strong>Delivery Address:</strong></td>
          <td style="color: #0f172a;">${order.shippingAddress || 'On file'}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${trackingUrl}" style="display: inline-block; background-color: ${headerColor}; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View Order Details
      </a>
    </div>
  `;

  return baseEmailLayout({
    title: statusTitle,
    headerColor,
    content,
  });
};

module.exports = customerOrderStatusTemplate;

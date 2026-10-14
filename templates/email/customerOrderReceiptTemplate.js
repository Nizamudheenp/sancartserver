const baseEmailLayout = require('./baseEmailLayout');

const customerOrderReceiptTemplate = (order) => {
  const itemsRows = (order.products || [])
    .map(
      (p, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 500;">
          ${p.productId?.title || p.productId?.name || 'Product'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">
          ${p.quantity}
        </td>
      </tr>
    `
    )
    .join('');

  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/myorders`;

  const content = `
    <p style="font-size: 15px; margin: 0 0 16px;">
      Thank you for shopping with us! We have received your order and are getting it ready for dispatch.
    </p>

    <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 20px;">
      <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px;">
        <tr>
          <td style="color: #64748b; width: 140px;"><strong>Order ID:</strong></td>
          <td style="color: #0f172a; font-weight: 600;">#${order.orderId || order._id}</td>
        </tr>
        <tr>
          <td style="color: #64748b;"><strong>Payment Method:</strong></td>
          <td style="color: #0f172a;">${order.paymentMethod || 'Online'}</td>
        </tr>
        <tr>
          <td style="color: #64748b;"><strong>Total Amount:</strong></td>
          <td style="color: #0f172a; font-weight: 700; color: #16a34a;">₹${order.totalAmount}</td>
        </tr>
        <tr>
          <td style="color: #64748b; vertical-align: top;"><strong>Delivery Address:</strong></td>
          <td style="color: #0f172a;">${order.shippingAddress}</td>
        </tr>
      </table>
    </div>

    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">
          <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">#</th>
          <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Item</th>
          <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: center;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${trackingUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Track Your Order
      </a>
    </div>
  `;

  return baseEmailLayout({
    title: '🎉 Order Confirmation',
    headerColor: '#10b981',
    content,
  });
};

module.exports = customerOrderReceiptTemplate;

const baseEmailLayout = require('./baseEmailLayout');

const adminReturnTemplate = (returnReq) => {
  const adminUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders`;

  const content = `
    <p style="font-size: 15px; margin: 0 0 16px;">
      A customer has submitted a new return/refund request.
    </p>

    <div style="background-color: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; padding: 16px; margin-bottom: 20px;">
      <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px;">
        <tr>
          <td style="color: #991b1b; width: 140px;"><strong>Return ID:</strong></td>
          <td style="color: #450a0a; font-weight: 600;">#${returnReq._id}</td>
        </tr>
        <tr>
          <td style="color: #991b1b;"><strong>Order ID:</strong></td>
          <td style="color: #450a0a;">#${returnReq.orderId?.orderId || returnReq.orderId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #991b1b;"><strong>Requested Action:</strong></td>
          <td style="color: #450a0a; font-weight: 600;">${returnReq.returnOption || 'Refund'}</td>
        </tr>
        <tr>
          <td style="color: #991b1b;"><strong>Reason:</strong></td>
          <td style="color: #450a0a;">${returnReq.reason}</td>
        </tr>
        ${
          returnReq.details
            ? `
        <tr>
          <td style="color: #991b1b; vertical-align: top;"><strong>Details:</strong></td>
          <td style="color: #450a0a;">${returnReq.details}</td>
        </tr>`
            : ''
        }
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${adminUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Review Return Request
      </a>
    </div>
  `;

  return baseEmailLayout({
    title: '⚠️ New Return Request Received',
    headerColor: '#dc2626',
    content,
  });
};

module.exports = adminReturnTemplate;

const baseEmailLayout = require('./baseEmailLayout');

const customerReturnDecisionTemplate = (returnReq, status) => {
  const isApproved = status === 'approved';
  const headerColor = isApproved ? '#10b981' : '#dc2626';
  const headerTitle = isApproved ? '✅ Return Request Approved' : '❌ Return Request Update';
  const supportUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/help`;

  const content = `
    <p style="font-size: 15px; margin: 0 0 16px;">
      Your return/refund request has been reviewed by the Sancart team and marked as <strong>${status.toUpperCase()}</strong>.
    </p>

    <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 20px;">
      <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px;">
        <tr>
          <td style="color: #64748b; width: 140px;"><strong>Status:</strong></td>
          <td style="color: ${headerColor}; font-weight: 700; text-transform: uppercase;">${status}</td>
        </tr>
        <tr>
          <td style="color: #64748b;"><strong>Return Option:</strong></td>
          <td style="color: #0f172a; font-weight: 600;">${returnReq.returnOption || 'Refund / Replacement'}</td>
        </tr>
        <tr>
          <td style="color: #64748b;"><strong>Reason:</strong></td>
          <td style="color: #0f172a;">${returnReq.reason || 'Customer request'}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${supportUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Contact Support / Help Center
      </a>
    </div>
  `;

  return baseEmailLayout({
    title: headerTitle,
    headerColor,
    content,
  });
};

module.exports = customerReturnDecisionTemplate;

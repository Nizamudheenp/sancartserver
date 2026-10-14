const baseEmailLayout = require('./baseEmailLayout');

const contactMessageTemplate = ({ name, email, message }) => {
  const content = `
    <p style="font-size: 15px; margin: 0 0 16px;">
      You have received a new contact inquiry from the Sancart website.
    </p>

    <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 20px;">
      <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 14px;">
        <tr>
          <td style="color: #64748b; width: 100px;"><strong>Name:</strong></td>
          <td style="color: #0f172a; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="color: #64748b;"><strong>Email:</strong></td>
          <td style="color: #0f172a;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
        </tr>
        <tr>
          <td style="color: #64748b; vertical-align: top;"><strong>Message:</strong></td>
          <td style="color: #0f172a; white-space: pre-wrap; line-height: 1.5;">${message}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <a href="mailto:${email}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">
        Reply Directly to ${name}
      </a>
    </div>
  `;

  return baseEmailLayout({
    title: `📬 Contact Inquiry from ${name}`,
    headerColor: '#0f172a',
    content,
  });
};

module.exports = contactMessageTemplate;

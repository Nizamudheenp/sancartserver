/**
 * Base email layout wrapper providing unified branding, responsive shell, and footer
 */
const baseEmailLayout = ({ title, headerColor = '#0f172a', content }) => {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'Sancart'}</title>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
              <!-- Header -->
              <tr>
                <td style="background-color: ${headerColor}; padding: 24px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
                    ${title}
                  </h1>
                </td>
              </tr>
              <!-- Body Content -->
              <tr>
                <td style="padding: 28px 24px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                  <p style="margin: 0 0 6px;">Thank you for choosing <strong>Sancart</strong>.</p>
                  <p style="margin: 0;">&copy; ${currentYear} Sancart Inc. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = baseEmailLayout;

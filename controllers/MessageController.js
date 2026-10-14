const ContactMessageRequestDTO = require('../dtos/messagedto/ContactMessageRequestDTO');
const { sendContactFormEmail } = require('../utils/emailService');

exports.contactEmail = async (req, res, next) => {
  try {
    const messageReq = new ContactMessageRequestDTO(req.body);

    sendContactFormEmail(messageReq).catch((err) => {
      console.error('Error sending contact email in background:', err.message);
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error processing contact email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

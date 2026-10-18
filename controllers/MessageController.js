const ContactMessageRequestDTO = require('../dtos/messagedto/ContactMessageRequestDTO');
const { sendContactFormEmail } = require('../utils/emailService');

exports.contactEmail = async (req, res, next) => {
  try {
    const messageReq = new ContactMessageRequestDTO(req.body);

    await sendContactFormEmail(messageReq);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

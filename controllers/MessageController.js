const express  =require("express")
const nodemailer = require('nodemailer')
const ContactMessageRequestDTO = require('../dtos/messagedto/ContactMessageRequestDTO');

exports.contactEmail =  async (req, res) => {
  const messageReq = new ContactMessageRequestDTO(req.body);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: messageReq.email,
      to: process.env.MAIL_TO, 
      subject: `New Contact Form Submission from ${messageReq.name}`,
      text: `Name: ${messageReq.name}\nEmail: ${messageReq.email}\n\nMessage:\n${messageReq.message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

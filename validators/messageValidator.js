const { z } = require('zod');

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  message: z.string().trim().min(1, 'Message is required'),
});

module.exports = {
  contactMessageSchema,
};

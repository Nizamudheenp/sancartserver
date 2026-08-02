const { z } = require('zod');

const createRazorpayOrderSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be a positive number'),
});

module.exports = {
  createRazorpayOrderSchema,
};

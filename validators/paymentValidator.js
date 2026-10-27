const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createRazorpayOrderSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be a positive number').optional(),
  products: z.array(
    z.object({
      productId: objectIdSchema,
      quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
    })
  ).optional(),
});

module.exports = {
  createRazorpayOrderSchema,
};

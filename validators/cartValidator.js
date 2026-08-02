const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format');

const cartItemSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
});

module.exports = {
  cartItemSchema,
};

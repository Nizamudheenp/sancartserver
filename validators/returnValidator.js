const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createReturnSchema = z.object({
  orderId: objectIdSchema,
  productId: objectIdSchema,
  reason: z.string().trim().min(1, 'Reason for return is required'),
  details: z.string().trim().optional(),
  returnOption: z.enum(["Refund", "Replacement"], {
    errorMap: () => ({ message: 'Return option must be Refund or Replacement' })
  }),
});

module.exports = {
  createReturnSchema,
};

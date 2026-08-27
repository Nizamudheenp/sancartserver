const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const createOrderSchema = z.object({
  products: z.array(
    z.object({
      productId: objectIdSchema,
      quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one product'),
  totalAmount: z.coerce.number().positive('Total amount must be a positive number'),
  shippingAddress: z.string().trim().min(1, 'Shipping address is required'),
  paymentId: z.string().trim().min(1, 'Payment ID is required').optional().or(z.literal('')),
  paymentMethod: z.enum(["Online", "COD"]).default("Online"),
  status: z.enum(["processing", "shipped", "paid", "delivered", "cancelled", "refunded"]).default("processing"),
  guestEmail: z.string().trim().email('Invalid email format').optional().or(z.literal('')),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["processing", "shipped", "paid", "delivered", "cancelled", "refunded"], {
    errorMap: () => ({ message: 'Invalid order status value' })
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};

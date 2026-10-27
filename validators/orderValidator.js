const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, 'Recipient name is required'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number is required'),
  street: z.string().trim().min(1, 'Street address is required'),
  landmark: z.string().trim().optional().or(z.literal('')).default(''),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Valid 6-digit PIN code is required'),
});

const createOrderSchema = z.object({
  products: z.array(
    z.object({
      productId: objectIdSchema,
      quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one product'),
  totalAmount: z.coerce.number().positive('Total amount must be a positive number'),
  shippingAddress: shippingAddressSchema,
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

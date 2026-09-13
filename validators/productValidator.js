const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  mrp: z.coerce.number().nonnegative('MRP must be non-negative').optional().default(0),
  weight: z.string().trim().optional().default(''),
  size: z.string().trim().optional().default(''),
  isReadyToShip: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().default(true),
  category: z.string().trim().min(1, 'Category is required'),
  brand: z.string().trim().min(1, 'Brand is required'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer').default(0),
  tags: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        if (!val.trim()) return [];
        return val.split(',').map(t => t.trim());
      }
      return val;
    },
    z.array(z.string()).default([])
  )
});

const updateProductSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').optional(),
  price: z.coerce.number().positive('Price must be a positive number').optional(),
  mrp: z.coerce.number().nonnegative().optional(),
  weight: z.string().trim().optional(),
  size: z.string().trim().optional(),
  isReadyToShip: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  category: z.string().trim().min(1, 'Category cannot be empty').optional(),
  brand: z.string().trim().min(1, 'Brand cannot be empty').optional(),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer').optional(),
  existingImages: z.any().optional(),
  images: z.any().optional(),
  tags: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        if (!val.trim()) return [];
        return val.split(',').map(t => t.trim());
      }
      return val;
    },
    z.array(z.string())
  ).optional()
}).passthrough();

const addReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Please select a star rating between 1 and 5').max(5, 'Rating cannot exceed 5'),
  comment: z.string().trim().optional().default(''),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  addReviewSchema,
};
